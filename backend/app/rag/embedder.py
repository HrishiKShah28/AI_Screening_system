"""Dense embedding generation using all-MiniLM-L6-v2 (ONNX / Sentence-Transformers)."""

from typing import List, Optional
from app.config import settings


class SentenceTransformerEmbedder:
    """
    Generates 384-dimensional dense vector embeddings.
    Uses ChromaDB's built-in ONNX all-MiniLM-L6-v2 or SentenceTransformer for ultra-fast,
    local, zero-network embedding inference.
    """

    _instance: Optional["SentenceTransformerEmbedder"] = None

    def __init__(self, model_name: Optional[str] = None, device: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self.device = device or settings.EMBEDDING_DEVICE
        self._embed_fn = None

    @classmethod
    def get_instance(cls) -> "SentenceTransformerEmbedder":
        """Singleton accessor to ensure unified embedder handle."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _ensure_model(self):
        """Lazy load the embedding function."""
        if self._embed_fn is None:
            try:
                import chromadb.utils.embedding_functions as ef
                # Uses ONNX all-MiniLM-L6-v2 (384-dimensional) locally with zero dependencies
                self._embed_fn = ef.DefaultEmbeddingFunction()
            except Exception:
                from sentence_transformers import SentenceTransformer
                st_model = SentenceTransformer(self.model_name, device=self.device)
                self._embed_fn = lambda texts: st_model.encode(texts, normalize_embeddings=True).tolist()

    def embed_texts(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Generates 384-d normalized vector embeddings for a list of text passages."""
        if not texts:
            return []
        self._ensure_model()
        results = self._embed_fn(texts)
        # Ensure return type is List[List[float]]
        return [list(map(float, vec)) for vec in results]

    def embed_query(self, query: str) -> List[float]:
        """Generates a single 384-d vector embedding for a search query."""
        self._ensure_model()
        results = self._embed_fn([query])
        return [float(x) for x in results[0]]
