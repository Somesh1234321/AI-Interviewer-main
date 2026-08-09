"""Render-friendly launch script.

Ensures Uvicorn binds to the host/port provided by the platform
(``$PORT`` on Render/Heroku) with graceful logging.
"""

import os
import uvicorn

from app.config import settings


def main() -> None:
    host = os.environ.get("HOST", settings.api_host)
    port = int(os.environ.get("PORT", settings.api_port))

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # disable reload in production
        log_level="info",
    )


if __name__ == "__main__":
    main()

