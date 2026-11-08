"""Application configuration loaded via Pydantic Settings."""

import os
from pathlib import Path
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # screening_system/


class Settings(BaseSettings):
    """System-wide configuration settings."""

    # Server Configuration
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database & Storage
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'screening_system.db'}"
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "data" / "chroma_db")
    KNOWLEDGE_BASE_DIR: str = str(BASE_DIR / "data" / "knowledge_base")
    SAMPLE_RESUMES_DIR: str = str(BASE_DIR / "data" / "sample_resumes")

    # Embeddings (Local Sentence-Transformers)
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DEVICE: str = "cpu"

    # LLM Gateway Configuration
    LLM_PROVIDER: str = "groq"  # "groq", "gemini", or "openai"

    # Groq Settings (Default, Free Tier)
    GROQ_API_KEY: str = Field(default="", description="API key from console.groq.com")
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Gemini Settings (Optional Fallback)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # OpenAI Settings (Optional Fallback)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"

    # Interview Session Parameters
    DEFAULT_TOTAL_QUESTIONS: int = 5
    MAX_TIME_PER_QUESTION_SECONDS: int = 300
    RAG_TOP_K_CHUNKS: int = 3
    RAG_SIMILARITY_THRESHOLD: float = 0.55

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            import json
            try:
                return json.loads(v)
            except Exception:
                return [v]
        return v

    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Ensure critical data directories exist
os.makedirs(os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")), exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(settings.KNOWLEDGE_BASE_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_RESUMES_DIR, exist_ok=True)

