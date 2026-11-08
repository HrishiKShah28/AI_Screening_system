"""Custom application exception hierarchy."""

from typing import Any, Dict, Optional


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            message=f"{entity_name} with id '{entity_id}' not found.",
            status_code=404,
            details={"entity": entity_name, "id": entity_id},
        )


class ValidationException(AppException):
    """Raised when input validation fails in business logic."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=422, details=details)


class RAGRetrievalException(AppException):
    """Raised when knowledge retrieval from vector store fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=500, details=details)


class LLMGenerationException(AppException):
    """Raised when LLM API call fails or produces unparseable output."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=502, details=details)


class SessionStateConflictException(AppException):
    """Raised when an action is incompatible with the session state."""

    def __init__(self, session_id: str, current_state: str, attempted_action: str):
        super().__init__(
            message=f"Cannot execute '{attempted_action}' while session '{session_id}' is in state '{current_state}'.",
            status_code=409,
            details={"session_id": session_id, "current_state": current_state, "action": attempted_action},
        )

