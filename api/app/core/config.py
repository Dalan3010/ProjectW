from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@db:5432/jak_db"
    SECRET_KEY: str = "your-super-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    N8N_WEBHOOK_URL: str = "http://n8n:5678/webhook/"

    class Config:
        env_file = ".env"

settings = Settings()
