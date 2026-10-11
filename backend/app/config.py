import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # App
    APP_ENV: str = Field(default="development", description="Environment: development, test, production")
    APP_HOST: str = Field(default="127.0.0.1")
    APP_PORT: int = Field(default=8000)
    PORT: int = Field(default=0, description="Injected by hosting services like Render")
    FRONTEND_URL: str = Field(default="http://localhost:5173")

    # AI Configuration (Hosted Only - No Ollama)
    USE_MOCK_AI: bool = Field(default=True, description="Use built-in mock AI for testing & offline local dev")
    AI_PROVIDER: str = Field(default="mock", description="Options: mock, openai, gemini, anthropic, openrouter, groq")
    AI_API_KEY: str = Field(default="", description="Secret hosted API key")
    AI_MODEL: str = Field(default="gpt-4o-mini")
    AI_BASE_URL: str = Field(default="", description="Custom base URL for OpenAI-compatible providers")
    AI_TIMEOUT_SECONDS: float = Field(default=45.0)
    AI_MAX_RETRIES: int = Field(default=3)

    # Embedding Configuration
    EMBEDDING_PROVIDER: str = Field(default="mock", description="Options: mock, openai, gemini")
    EMBEDDING_API_KEY: str = Field(default="")
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-small")

    # Database
    DATABASE_URL: str = Field(default="sqlite:///./nyaya_ai.db")

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = Field(default="")
    TELEGRAM_POLLING_TIMEOUT: int = Field(default=30)
    TELEGRAM_RATE_LIMIT_PER_MINUTE: int = Field(default=20)

    # Security
    MAX_UPLOAD_FILE_SIZE_MB: int = Field(default=10)
    ALLOWED_UPLOAD_EXTENSIONS: str = Field(default="pdf,txt")
    CORS_ORIGINS: str = Field(default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_UPLOAD_EXTENSIONS.split(",") if ext.strip()]

    @property
    def effective_port(self) -> int:
        """Reads PORT from hosting environment (Render, Cloud Run, etc.) or falls back to APP_PORT."""
        port_env = os.environ.get("PORT")
        if port_env:
            try:
                return int(port_env)
            except ValueError:
                pass
        if self.PORT and self.PORT > 0:
            return self.PORT
        return self.APP_PORT

    @property
    def effective_host(self) -> str:
        """Binds to 0.0.0.0 in cloud/container environments, or APP_HOST locally."""
        if os.environ.get("RENDER") or os.environ.get("PORT") or self.APP_ENV == "production":
            return "0.0.0.0"
        return self.APP_HOST

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
