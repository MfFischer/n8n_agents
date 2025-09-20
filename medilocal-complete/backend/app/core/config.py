from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MediLocal AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://medilocal:medilocal2024@postgres:5432/medilocal"
    
    # External Services
    N8N_URL: str = "http://localhost:5678"
    OLLAMA_URL: str = "http://localhost:11434"
    QDRANT_URL: str = "http://localhost:6333"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR: str = "data/uploads"
    PROCESSED_DIR: str = "data/processed"
    
    # AI Models
    DEFAULT_LLM_MODEL: str = "llama3.2"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    
    # Medical Settings
    ANONYMIZATION_ENABLED: bool = True
    AUDIT_LOGGING_ENABLED: bool = True
    GDPR_COMPLIANCE_MODE: bool = True
    
    # Language Settings
    DEFAULT_LANGUAGE: str = "de"  # German
    SUPPORTED_LANGUAGES: str = "de,en"

    @property
    def supported_languages_list(self) -> list[str]:
        return self.SUPPORTED_LANGUAGES.split(",")
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/medilocal.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
