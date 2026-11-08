"""Textbook corpus ingestion script for ChromaDB vector store and SQLite metadata."""

import argparse
import hashlib
import os
from pathlib import Path
import sys

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.core.database import SessionLocal
from app.models.knowledge import KnowledgeDocument
from app.models.role import Role
from app.rag.document_loader import DocumentLoader, DocumentPage
from app.rag.chunker import RecursiveTextChunker
from app.rag.embedder import SentenceTransformerEmbedder
from app.rag.vector_store import ChromaVectorStore


# Curated foundational reference excerpts for instant offline bootstrapping
CURATED_FOUNDATIONS = {
    "ai_ml_engineer": [
        {
            "book_title": "The Hundred-Page Machine Learning Book",
            "author": "Andriy Burkov",
            "pages": [
                DocumentPage(
                    page_number=32,
                    text="""Chapter 3: Fundamental Algorithms.
Gradient Descent is an iterative optimization algorithm used to minimize an objective function (cost or loss function) that is parameterized by a model's parameters.
The standard (or batch) gradient descent computes the gradient of the cost function with respect to the parameters for the entire training dataset:
w := w - alpha * grad(J(w))
where alpha is the learning rate. In batch gradient descent, convergence is guaranteed to the global minimum for convex error surfaces and to a local minimum for non-convex surfaces. However, calculating the gradient over the entire dataset at each iteration can be computationally prohibitive when the dataset does not fit into memory.

Stochastic Gradient Descent (SGD) solves this bottleneck by calculating the gradient and updating parameters for each training example (x_i, y_i) individually. While SGD is substantially faster and can operate in an online streaming setting, the objective function fluctuates heavily with high variance. This variance allows the parameter vector to jump out of sub-optimal local minima, but makes precise convergence to the exact minimum challenging without an adaptive learning rate decay schedule.

Mini-Batch Gradient Descent bridges the gap by computing the gradient over small batches (typically 32, 64, or 128 samples). It reduces variance relative to SGD while exploiting hardware SIMD vectorization on modern GPUs. Choosing an appropriate batch size involves balancing statistical efficiency with hardware computational throughput.""",
                    char_count=1380,
                    estimated_tokens=345,
                ),
                DocumentPage(
                    page_number=45,
                    text="""Regularization and Generalization.
A central challenge in machine learning is preventing overfitting—where a model learns noise and idiosyncrasies of the training data rather than underlying patterns.
L2 Regularization (Ridge regression or weight decay) penalizes large weights by adding the sum of squared weights to the loss:
J_reg(w) = J(w) + lambda * ||w||_2^2
This shrinks weights smoothly toward zero without eliminating them completely. The geometric interpretation is constraining the weight vector within a hypersphere.

L1 Regularization (Lasso regression) adds the sum of absolute values:
J_reg(w) = J(w) + lambda * ||w||_1
Due to the sharp corners of the L1 ball on coordinate axes, L1 regularization drives many weights exactly to zero, effectively performing automatic feature selection. In high-dimensional datasets with sparse signals, L1 regularization produces more interpretable and compact representations.""",
                    char_count=980,
                    estimated_tokens=245,
                ),
                DocumentPage(
                    page_number=58,
                    text="""Decision Trees and Ensemble Learning.
Decision trees partition feature space through greedy, recursive binary splitting. At each node, the split criterion evaluates information gain using Shannon Entropy or Gini Impurity:
Gini = 1 - sum(p_i^2)
Entropy = - sum(p_i * log2(p_i))
While decision trees require minimal feature preprocessing and naturally handle mixed data types, unconstrained trees suffer from high variance and quickly overfit.

Ensemble methods combine multiple base models to produce a stronger predictor. Bagging (Bootstrap Aggregation), exemplified by Random Forests, trains decision trees in parallel on bootstrap samples while randomly subsampling feature subsets at each split. This decorrelates individual trees and dramatically reduces prediction variance without increasing bias.
Boosting, in contrast, trains trees sequentially. Each new tree focuses on correcting the residual errors or misclassified instances of the previous ensemble by reweighting instances (AdaBoost) or fitting negative gradients of the loss function (Gradient Boosted Decision Trees / XGBoost). Boosting primarily reduces bias while controlling variance via learning rate shrinkage.""",
                    char_count=1220,
                    estimated_tokens=305,
                ),
            ],
        },
        {
            "book_title": "Machine Learning",
            "author": "Tom Mitchell",
            "pages": [
                DocumentPage(
                    page_number=88,
                    text="""Evaluating Hypotheses and Error Estimation.
In experimental machine learning, evaluating the performance of a learned hypothesis requires estimating its true error over the entire probability distribution of instances, rather than merely its sample error on training instances.
Sample error is defined as the proportion of training instances misclassified:
error_S(h) = (1 / n) * sum(delta(c(x), h(x)))
When estimating true error, using the training set introduces optimistic bias. True generalization must be assessed on independent test data drawn from the same distribution D.

When test data is limited, k-fold cross-validation partitions the dataset into k equal disjoint subsets. The model is trained on k-1 folds and validated on the remaining fold, repeating this procedure k times. The mean validation error across all k folds provides an approximately unbiased estimator of generalization performance.
For imbalanced classification problems, accuracy is misleading. Precision, Recall, and the F1-score provide calibrated diagnostic insight:
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
F1 = 2 * (Precision * Recall) / (Precision + Recall)
The Receiver Operating Characteristic (ROC) curve evaluates the trade-off across all classification thresholds, and the Area Under the Curve (AUC) measures aggregate separability independent of decision threshold.""",
                    char_count=1350,
                    estimated_tokens=337,
                ),
            ],
        },
    ],
    "data_science_applied_ml": [
        {
            "book_title": "Introduction to Machine Learning with Python",
            "author": "Andreas Müller & Sarah Guido",
            "pages": [
                DocumentPage(
                    page_number=112,
                    text="""Data Preprocessing and Feature Scaling in Scikit-Learn.
Many machine learning algorithms—including Support Vector Machines (SVM), k-Nearest Neighbors (k-NN), and regularized linear models—are sensitive to the scale of input features. When features have vastly different numeric magnitudes (e.g. income in tens of thousands versus age in decades), gradient updates or distance calculations are dominated by large-scale features.

StandardScaler transforms each feature by subtracting its mean and scaling to unit variance:
z = (x - mu) / sigma
MinMaxScaler rescales features into a bounded range [0, 1], which is desirable when features have hard minimum/maximum boundaries or when preserving zero entries in sparse matrices is required.
CRITICAL BEST PRACTICE: Feature scalers must strictly be fitted ONLY on the training split:
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)
Fitting a scaler or imputer on the combined dataset before train/test splitting causes data leakage, contaminating the evaluation with test set statistics and leading to overly optimistic cross-validation results.""",
                    char_count=1200,
                    estimated_tokens=300,
                ),
                DocumentPage(
                    page_number=184,
                    text="""Hyperparameter Tuning and Cross-Validation Pipelines.
Model evaluation and parameter selection require strict separation of concerns to avoid optimistic bias.
In scikit-learn, combining preprocessing steps and model estimators inside a `Pipeline` ensures that transformations like scaling and imputation are computed within each cross-validation fold, preventing information leakage from validation folds into training folds.

GridSearchCV performs exhaustive combinatorial search over specified hyperparameter grids using cross-validation. For large parameter spaces, RandomizedSearchCV samples a fixed number of parameter settings from probability distributions, often reaching optimal or near-optimal configurations with a fraction of the computational budget.
When reporting final model accuracy on a new dataset, Nested Cross-Validation should be utilized: an inner cross-validation loop selects optimal hyperparameters, while an outer cross-validation loop provides an unbiased estimate of generalization error.""",
                    char_count=1100,
                    estimated_tokens=275,
                ),
            ],
        },
    ],
    "backend_engineer": [
        {
            "book_title": "Designing Data-Intensive Applications",
            "author": "Martin Kleppmann",
            "pages": [
                DocumentPage(
                    page_number=74,
                    text="""Storage Engines, B-Trees, and Indexing.
Database storage engines use indexes to accelerate query retrieval at the expense of write overhead.
B-Trees are the standard index implementation in relational databases. They break a database down into fixed-size blocks or pages (traditionally 4KB) and write one page at a time. The B-Tree maintains balanced depth: an N-key tree has depth O(log N). Updates overwrite pages on disk, requiring a Write-Ahead Log (WAL) to ensure crash recovery and durability.

In contrast, Log-Structured Merge-Trees (LSM-Trees) buffer incoming writes in an in-memory balanced tree (memtable). When the memtable exceeds a threshold, it is flushed to disk as an immutable sorted string table (SSTable). Background compaction continuously merges SSTables and discards overwritten or deleted keys. LSM-Trees typically sustain higher write throughput than B-Trees because they transform random disk writes into sequential append-only writes, making them well-suited for high-ingestion workloads.""",
                    char_count=1150,
                    estimated_tokens=287,
                ),
            ],
        }
    ],
}


def ingest_curated_foundations(db, vector_store, chunker, embedder):
    """Bootstraps foundational textbook corpus for out-of-the-box readiness."""
    print("[*] Ingesting curated foundational textbook literature...")

    for role_id, books in CURATED_FOUNDATIONS.items():
        role = db.query(Role).filter(Role.id == role_id).first()
        collection_name = role.vector_collection_name if role else f"{role_id}_corpus"

        for b in books:
            chunks = chunker.chunk_pages(
                pages=b["pages"],
                book_title=b["book_title"],
                author=b["author"],
                role_id=role_id,
            )

            # Store in ChromaDB
            added = vector_store.add_chunks(
                collection_name=collection_name,
                chunks=chunks,
                embedder=embedder,
            )

            # Update SQLite KnowledgeDocument
            doc_hash = hashlib.sha256(b["book_title"].encode("utf-8")).hexdigest()
            doc_record = db.query(KnowledgeDocument).filter(KnowledgeDocument.file_hash == doc_hash).first()
            if not doc_record:
                doc_record = KnowledgeDocument(
                    role_id=role_id,
                    book_title=b["book_title"],
                    author=b["author"],
                    file_path="curated://foundations",
                    file_hash=doc_hash,
                    total_pages=len(b["pages"]),
                    total_chunks=len(chunks),
                )
                db.add(doc_record)
            else:
                doc_record.total_chunks = len(chunks)

            db.commit()
            print(f"  + Ingested '{b['book_title']}' for [{role_id}]: {added} chunks into '{collection_name}'")


def ingest_pdf_files(directory_path: str, role_id: str, db, vector_store, chunker, embedder):
    """Ingests all PDF files found in the specified directory."""
    path = Path(directory_path)
    if not path.exists():
        print(f"[!] Directory {directory_path} does not exist.")
        return

    pdf_files = list(path.glob("*.pdf"))
    if not pdf_files:
        print(f"[*] No PDF files found in {directory_path}.")
        return

    role = db.query(Role).filter(Role.id == role_id).first()
    collection_name = role.vector_collection_name if role else f"{role_id}_corpus"

    for pdf_path in pdf_files:
        print(f"[*] Processing PDF: {pdf_path.name} for role {role_id}...")
        # Compute hash
        hasher = hashlib.sha256()
        with open(pdf_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        file_hash = hasher.hexdigest()

        # Check if already ingested
        existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.file_hash == file_hash).first()
        if existing:
            print(f"  * Already ingested: {pdf_path.name}")
            continue

        pages = DocumentLoader.load_pdf(str(pdf_path))
        book_title = pdf_path.stem.replace("_", " ").title()
        chunks = chunker.chunk_pages(pages, book_title=book_title, author="Ingested Reference", role_id=role_id)

        added = vector_store.add_chunks(collection_name, chunks, embedder)

        doc_record = KnowledgeDocument(
            role_id=role_id,
            book_title=book_title,
            author="Ingested Reference",
            file_path=str(pdf_path),
            file_hash=file_hash,
            total_pages=len(pages),
            total_chunks=added,
        )
        db.add(doc_record)
        db.commit()
        print(f"  + Ingested {pdf_path.name}: {len(pages)} pages, {added} chunks.")


def main():
    parser = argparse.ArgumentParser(description="Ingest textbook PDFs into ChromaDB.")
    parser.add_argument("--curated-only", action="store_true", help="Ingest only curated foundations")
    args = parser.parse_args()

    db = SessionLocal()
    vector_store = ChromaVectorStore.get_instance()
    chunker = RecursiveTextChunker()
    embedder = SentenceTransformerEmbedder.get_instance()

    try:
        # 1. Ingest curated foundational literature
        ingest_curated_foundations(db, vector_store, chunker, embedder)

        # 2. Ingest external PDFs if present
        if not args.curated_only:
            ai_dir = Path(settings.KNOWLEDGE_BASE_DIR) / "ai_ml"
            ds_dir = Path(settings.KNOWLEDGE_BASE_DIR) / "data_science"
            ingest_pdf_files(str(ai_dir), "ai_ml_engineer", db, vector_store, chunker, embedder)
            ingest_pdf_files(str(ds_dir), "data_science_applied_ml", db, vector_store, chunker, embedder)

        print("\n[+] Knowledge base ingestion completed successfully.")
        stats = vector_store.get_collection_stats()
        print("Current ChromaDB Collections:")
        for s in stats:
            print(f" - Collection '{s['name']}': {s['total_chunks']} chunks")

    finally:
        db.close()


if __name__ == "__main__":
    main()

