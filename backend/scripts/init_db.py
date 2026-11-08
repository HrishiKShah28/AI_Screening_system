"""Database initialization and role seeding script."""

import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' imports work
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import engine, Base, SessionLocal
from app.models.role import Role
import app.models  # Ensures all models are registered with Base.metadata


def seed_roles(db):
    """Seed initial role definitions if not already present."""
    default_roles = [
        Role(
            id="ai_ml_engineer",
            title="AI / Machine Learning Engineer",
            description="Evaluates foundational ML algorithms, neural architectures, training dynamics, loss optimization, and feature engineering.",
            primary_topics=[
                "Supervised & Unsupervised Learning",
                "Gradient Descent & Backpropagation",
                "Overfitting & Regularization",
                "Evaluation Metrics (ROC, AUC, F1, Log-Loss)",
                "Decision Trees & Ensemble Methods",
            ],
            vector_collection_name="ai_ml_corpus",
        ),
        Role(
            id="data_science_applied_ml",
            title="Data Science / Applied ML Engineer",
            description="Focuses on applied machine learning pipelines, scikit-learn implementations, data preprocessing, and algorithm selection.",
            primary_topics=[
                "Feature Preprocessing & Scaling",
                "Cross-Validation & Hyperparameter Tuning",
                "Scikit-Learn Model Selection",
                "Practical ML Algorithms (SVM, Random Forests, XGBoost)",
                "Error Analysis & Diagnostic Strategies",
            ],
            vector_collection_name="data_science_corpus",
        ),
        Role(
            id="backend_engineer",
            title="Backend Systems Engineer",
            description="Focuses on API design, database schemas, distributed systems, concurrency, and caching architectures.",
            primary_topics=[
                "REST & GraphQL Architecture",
                "Relational & NoSQL Database Indexing",
                "Caching Strategies & Invalidation",
                "Concurrency & Async Programming",
                "API Security & Rate Limiting",
            ],
            vector_collection_name="backend_corpus",
        ),
    ]

    for role_data in default_roles:
        existing = db.query(Role).filter(Role.id == role_data.id).first()
        if not existing:
            db.add(role_data)
            print(f"  + Seeded role: {role_data.title} ({role_data.id})")
        else:
            print(f"  * Role already exists: {role_data.title}")

    db.commit()


def main():
    print("[*] Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    print("[+] All database tables created successfully.")

    print("[*] Seeding role catalog...")
    db = SessionLocal()
    try:
        seed_roles(db)
        print("[+] Role seeding complete.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

