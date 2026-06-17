import os
import uvicorn

from main import app as cloudsec_app


if __name__ == "__main__":
    os.environ.setdefault("CLOUDSEC_DESKTOP_MODE", "1")

    uvicorn.run(
        cloudsec_app,
        host="127.0.0.1",
        port=8000,
        log_level="warning",
    )
