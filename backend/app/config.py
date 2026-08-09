import os

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
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
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("api_port", mode="before")
    @classmethod
    def use_render_port(cls, value):
        """Prefer the platform-provided PORT (Render, Heroku, etc.).

        Render injects a ``PORT`` environment variable at runtime. If present,
        it overrides any configured or default port so the app binds to the
        expected socket and doesn't crash at startup with an
        address-in-use / invalid-port error.
        """
        render_port = os.environ.get("PORT")
        if render_port:
            try:
                return int(render_port)
            except ValueError:
                return value
        return value


settings = Settings()

