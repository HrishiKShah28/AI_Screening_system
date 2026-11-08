"""ChromaDB vector store manager for textbook corpora."""

from typing import Any, Dict, List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings
from app.rag.chunker import DocumentChunk
from app.rag.embedder import SentenceTransformerEmbedder


class ChromaVectorStore:
    """Manages on-disk ChromaDB persistent collections partitioned by role."""

    _instance: Optional["ChromaVectorStore"] = None

    def __init__(self, persist_dir: Optional[str] = None):
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )

    @classmethod
    def get_instance(cls) -> "ChromaVectorStore":
        """Singleton accessor to ensure unified client handle."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_or_create_collection(self, collection_name: str):
        """Retrieves or initializes a ChromaDB collection with cosine distance metric."""
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(
        self,
        collection_name: str,
        chunks: List[DocumentChunk],
        embedder: Optional[SentenceTransformerEmbedder] = None,
        batch_size: int = 64,
    ) -> int:
        """
        Embeds and persists document chunks into the specified collection.
        Returns total chunks added.
        """
        if not chunks:
            return 0

        embedder = embedder or SentenceTransformerEmbedder.get_instance()
        collection = self.get_or_create_collection(collection_name)

        total_added = 0
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            texts = [c.text for c in batch]
            ids = [c.chunk_id for c in batch]
            embeddings = embedder.embed_texts(texts)
            metadatas = [
                {
                    "book_title": c.book_title,
                    "author": c.author,
                    "role_id": c.role_id,
                    "page_number": c.page_number,
                    "token_count": c.token_count,
                }
                for c in batch
            ]

            collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )
            total_added += len(batch)

        return total_added

    def query_similar(
        self,
        collection_name: str,
        query_embedding: List[float],
        top_k: int = 3,
        threshold: float = 0.55,
    ) -> List[Dict[str, Any]]:
        """
        Queries ChromaDB for top-k similar chunks, converts cosine distance to similarity score,
        and filters by threshold.
        """
        collection = self.get_or_create_collection(collection_name)
        count = collection.count()
        if count == 0:
            return []

        actual_k = min(top_k, count)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=actual_k,
            include=["documents", "metadatas", "distances"],
        )

        matched_chunks: List[Dict[str, Any]] = []

        if results and results.get("ids") and results["ids"][0]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0]
            ids = results["ids"][0]

            for doc_text, meta, dist, chunk_id in zip(docs, metas, distances, ids):
                # For cosine space in ChromaDB, cosine distance is: distance = 1 - cosine_similarity
                similarity = 1.0 - float(dist)

                if similarity >= threshold:
                    matched_chunks.append(
                        {
                            "chunk_id": chunk_id,
                            "text": doc_text,
                            "book_title": meta.get("book_title", "Technical Reference"),
                            "author": meta.get("author", "Unknown"),
                            "page_number": meta.get("page_number", 1),
                            "similarity_score": round(similarity, 4),
                        }
                    )

        return matched_chunks

    def get_collection_stats(self) -> List[Dict[str, Any]]:
        """Returns statistics for all existing collections in the vector store."""
        collections = self.client.list_collections()
        stats = []
        for col in collections:
            stats.append(
                {
                    "name": col.name,
                    "total_chunks": col.count(),
                    "metadata": col.metadata,
                }
            )
        return stats

