import logging
from logging.config import dictConfig

from core.config import settings


def configure_logging() -> None:
    """
    Configures console and file logging for CloudSec Auditor backend.
    """

    settings.logs_dir.mkdir(parents=True, exist_ok=True)

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "standard": {
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": settings.log_level,
                    "formatter": "standard",
                },
                "file": {
                    "class": "logging.FileHandler",
                    "level": settings.log_level,
                    "formatter": "standard",
                    "filename": str(settings.backend_log_file),
                    "encoding": "utf-8",
                },
            },
            "loggers": {
                "cloudsec": {
                    "handlers": ["console", "file"],
                    "level": settings.log_level,
                    "propagate": False,
                },
            },
            "root": {
                "handlers": ["console", "file"],
                "level": settings.log_level,
            },
        }
    )


def get_logger(name: str) -> logging.Logger:
    """
    Returns a CloudSec namespaced logger.
    """

    return logging.getLogger(f"cloudsec.{name}")
