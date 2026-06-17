from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import APP_DESCRIPTION, APP_NAME, APP_VERSION, ALLOWED_ORIGINS
from routes.report_routes import router as report_router
from routes.scan_routes import router as scan_router
from routes.status_routes import router as status_router

app = FastAPI(
    title=f"{APP_NAME} API",
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

# CORS allows the React/Electron frontend to talk to this backend.
# Later, the desktop app will run locally and call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(status_router)
app.include_router(scan_router)
app.include_router(report_router)
