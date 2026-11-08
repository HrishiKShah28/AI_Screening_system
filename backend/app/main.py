"""FastAPI application entrypoint and middleware configuration."""

from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.core.exceptions import AppException
from app.api import roles, resumes, interviews, knowledge

app = FastAPI(
    title="AI-Powered Role-Based Candidate Screening System",
    description="Automated technical screening system with textbook-grounded RAG, dynamic questioning, and rubric-based evaluations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details,
            "path": str(request.url.path),
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# System Health Check
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "provider": settings.LLM_PROVIDER,
        "model": settings.GROQ_MODEL,
        "database": "sqlite_ready",
        "timestamp": datetime.utcnow().isoformat(),
    }


# Include Domain Routers
app.include_router(roles.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True,
    )

