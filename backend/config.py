import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
    DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    # Database – SQLite for local dev, PostgreSQL in production
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///" + os.path.join(os.path.dirname(os.path.abspath(__file__)), "audioconverter.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24 * 7  # 7 days in seconds

    # Stripe
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_PLACEHOLDER")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_PLACEHOLDER")
    STRIPE_PRICE_ID = os.environ.get("STRIPE_PRICE_ID", "price_PLACEHOLDER")

    # File storage
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join("/tmp", "uploads"))
    CONVERTED_FOLDER = os.environ.get("CONVERTED_FOLDER", os.path.join("/tmp", "converted"))

    # Size limits (bytes)
    FREE_MAX_SIZE = 60 * 1024 * 1024       # 60 MB
    PREMIUM_MAX_SIZE = 500 * 1024 * 1024   # 500 MB
    MAX_CONTENT_LENGTH = PREMIUM_MAX_SIZE

    # Rate limits
    FREE_CONVERSIONS_PER_HOUR = 3

    # File TTL in seconds (1 hour)
    FILE_TTL = 60 * 60

    # Allowed audio formats
    ALLOWED_INPUT_EXTENSIONS = {"wav", "mp3", "flac", "aac", "ogg", "m4a", "aiff", "alac"}
    ALLOWED_OUTPUT_FORMATS = {"mp3", "wav", "flac", "aac", "ogg"}

    # Frontend URL (for Stripe redirects)
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
