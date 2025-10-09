# Configuration settings for the Flask application
import os
from pathlib import Path

# Load environment variables from .env file if it exists
env_file = Path(__file__).parent / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.strip() and not line.startswith('#') and '=' in line:
                key, value = line.strip().split('=', 1)
                os.environ.setdefault(key, value)

# Environment detection
ENVIRONMENT = os.getenv('FLASK_ENV', 'development')
DEBUG = ENVIRONMENT != 'production'

# CORS settings - Production and development
if ENVIRONMENT == 'production':
    CORS_ORIGINS = [
        "https://eye-q-app.vercel.app",
        # Add any other production domains here
    ]
else:
    CORS_ORIGINS = [
        "https://eye-q-app.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175"
    ]

# File upload settings
MAX_FILE_SIZE_MB = int(os.getenv('MAX_FILE_SIZE_MB', '10'))
ALLOWED_EXTENSIONS = ['.pdf']

# Server settings
HOST = os.getenv('HOST', '0.0.0.0' if ENVIRONMENT == 'production' else '127.0.0.1')
PORT = int(os.getenv('PORT', '5000'))

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')

# Rate limiting settings
RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', '60'))

# Firebase settings
FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
HOST = '0.0.0.0'
PORT = int(os.getenv('PORT', 5000))
