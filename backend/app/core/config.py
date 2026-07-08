from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ManthanX"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str

    DATABASE_URL: str
    REDIS_URL: str

    GEMINI_API_KEY: str
    LLM_MODEL: str = "gemini-2.5-flash-lite"

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    TAVILY_API_KEY: str | None = None

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:3000"
    JWT_SECRET_KEY: str

settings = Settings()