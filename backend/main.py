from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routes.report_routes import router as report_router
from routes.scan_routes import router as scan_router
from routes.status_routes import router as status_router

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

app.include_router(status_router)
app.include_router(scan_router)
app.include_router(report_router)
