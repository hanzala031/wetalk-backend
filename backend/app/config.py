import os
from dotenv import load_dotenv

# Load environment variables from the .env file in the backend directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path)

class Settings:
    PORT: int = int(os.getenv("PORT", 5000))
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/wetalk_db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "wetalk_super_secret_key_2024")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "wetalk_super_secret_key_2024")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "your_google_web_client_id_here")
    
    # SMTP config
    SMTP_HOST: str = os.getenv("MAIL_SERVER") or os.getenv("SMTP_HOST") or "smtp.gmail.com"
    SMTP_PORT: int = int(os.getenv("MAIL_PORT") or os.getenv("SMTP_PORT") or 587)
    SMTP_USER: str = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USER") or ""
    SMTP_PASS: str = os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASS") or ""
    MAIL_FROM: str = os.getenv("MAIL_FROM") or os.getenv("SMTP_USER") or ""
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "WeTalk Support")
    RESET_URL: str = os.getenv("RESET_URL", "http://192.168.100.6:8081/reset-password")
    
    # Cloudinary config
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

settings = Settings()
