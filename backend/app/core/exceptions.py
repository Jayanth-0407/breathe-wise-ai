from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class ExternalAPIException(Exception):
    def __init__(self, service: str, message: str, status_code: int = 502):
        self.service = service
        self.message = message
        self.status_code = status_code
        super().__init__(f"[{service}] {message}")

async def external_api_exception_handler(request: Request, exc: ExternalAPIException):
    logger.error(f"External API failure on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "ExternalServiceError",
            "service": exc.service,
            "message": exc.message,
            "path": request.url.path
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please try again later.",
            "path": request.url.path
        }
    )
