"""
Application configuration.

Settings are loaded from environment variables / a .env file using
pydantic-settings. Add any new environment variables here as typed fields.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    upstream_url: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# Single shared instance — import this everywhere instead of reading os.environ directly.
settings = Settings()