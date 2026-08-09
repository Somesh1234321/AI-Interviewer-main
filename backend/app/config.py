import os
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        # Render injects env vars as plain strings (e.g. CORS_ORIGINS).
        # Disable JSON decoding so comma-separated string lists work.
        enable_decoding=False,
    )

    app_name: str = "AI Interview Agent"
    app_version: str = "0.1.0"
    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]
    openai_api_key: str | None = None
    openai_api_base: str | None = None
    openai_model: str = "gpt-3.5-turbo"
    interview_turns_before_feedback: int = 5
    llm_request_timeout: float = 60.0
    llm_temperature: float = 0.7

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str]:
        # Handle a plain string that may be JSON, comma-separated, or a list.
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return ["http://localhost:3000"]
            if stripped.startswith("["):
                import json

                try:
                    parsed = json.loads(stripped)
                    if isinstance(parsed, list):
                        return [str(o).strip() for o in parsed if str(o).strip()]
                except Exception:  # noqa: BLE001 - fall through to CSV
                    pass
            return [
                origin.strip() for origin in stripped.split(",") if origin.strip()
            ]
        if isinstance(value, list):
            return [str(o).strip() for o in value if str(o).strip()]
        return value

    @field_validator("api_port", mode="before")
    @classmethod
    def use_render_port(cls, value):
        """Prefer the platform-provided PORT (Render, Heroku, etc.)."""
        render_port = os.environ.get("PORT")
        if render_port:
            try:
                return int(render_port)
            except ValueError:
                return value
        return value


settings = Settings()

