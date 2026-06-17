import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.error_handlers import register_error_handlers
from core.logging_config import configure_logging, get_logger
from routes.report_routes import router as report_router
from routes.aws_routes import router as aws_router
from routes.scan_routes import router as scan_router
from routes.status_routes import router as status_router

configure_logging()
logger = get_logger("main")

app = FastAPI(
    title=f"{settings.app_name} API",
    description=settings.app_description,
    version=settings.app_version,
)

# CORS allows the React/Electron frontend to talk to this backend.
# Later, the desktop app will run locally and call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(status_router)
app.include_router(aws_router)
app.include_router(scan_router)
app.include_router(report_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Logs every backend request with method, path, status code, and response time.
    """

    start_time = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.exception(
            "%s %s failed after %.2fms",
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = (time.perf_counter() - start_time) * 1000

    logger.info(
        "%s %s -> %s %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )

    return response


logger.info(
    "%s backend initialized | version=%s | mode=%s",
    settings.app_name,
    settings.app_version,
    settings.scan_mode,
)
