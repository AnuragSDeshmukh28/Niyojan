import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Niyojan Administrative & Digital Approval Platform"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/niyojan"
    
    # Security & Tokens
    JWT_SECRET_KEY: str = "niyojan_super_secret_jwt_key_2026_x89f4b"
    JWT_REFRESH_SECRET_KEY: str = "niyojan_super_secret_refresh_jwt_key_2026_k99a7m"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Storage & Uploads
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_UPLOAD_SIZE_MB: int = 10
    FRONTEND_URL: str = "http://localhost:5173"
    INSTITUTION_NAME: str = "Niyojan Educational Institution"
    
    # Digital Signatures
    DIGITAL_SIGNATURE_ENABLED: bool = True
    SIGNING_CERT_PATH: str = ""
    SIGNING_KEY_PATH: str = ""
    SIGNING_KEY_PASSWORD: str = ""

    # EVM Blockchain Anchor Settings
    BLOCKCHAIN_RPC_URL: str = "https://rpc-amoy.polygon.technology"
    BLOCKCHAIN_PRIVATE_KEY: str = ""
    BLOCKCHAIN_CONTRACT_ADDRESS: str = ""
    BLOCKCHAIN_EXPLORER_URL: str = "https://amoy.polygonscan.com/tx/"
    BLOCKCHAIN_ENABLED: bool = True
    
    # Seed Accounts
    INITIAL_ADMIN_EMAIL: str = "admin@institution.edu.in"
    INITIAL_ADMIN_PASSWORD: str = "Admin@Niyojan2026"
    INITIAL_PRINCIPAL_EMAIL: str = "principal@institution.edu.in"
    INITIAL_PRINCIPAL_PASSWORD: str = "Principal@Niyojan2026"
    INITIAL_MEDIATOR_EMAIL: str = "mediator@institution.edu.in"
    INITIAL_MEDIATOR_PASSWORD: str = "Mediator@Niyojan2026"
    INITIAL_FACULTY_EMAIL: str = "faculty@institution.edu.in"
    INITIAL_FACULTY_PASSWORD: str = "Faculty@Niyojan2026"
    INITIAL_STUDENT_EMAIL: str = "student@institution.edu.in"
    INITIAL_STUDENT_PASSWORD: str = "Student@Niyojan2026"
    INITIAL_PARENT_EMAIL: str = "parent@institution.edu.in"
    INITIAL_PARENT_PASSWORD: str = "Parent@Niyojan2026"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
