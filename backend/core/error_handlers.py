import logging

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("cloudsec.error_handlers")


def register_error_handlers(app: FastAPI) -> None:
    """
    Registers centralized API error handlers.

    This keeps frontend-facing errors consistent across the backend.
    """

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "error_type": "http_error",
                "message": str(exc.detail),
                "path": request.url.path,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ):
        return JSONResponse(
            status_code=422,
            content={
                "status": "error",
                "error_type": "validation_error",
                "message": "Request validation failed.",
                "path": request.url.path,
                "details": jsonable_encoder(exc.errors()),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled backend error: %s", exc)

        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error_type": "internal_server_error",
                "message": "An unexpected backend error occurred.",
                "path": request.url.path,
            },
        )
