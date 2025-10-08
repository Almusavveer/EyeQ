# Configuration settings for the Flask application
import os

# CORS settings - Production domain only
CORS_ORIGINS = [
    "https://eye-q-app.vercel.app"
]

# File upload settings
MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = ['.pdf']

# Server settings
DEBUG = os.getenv('FLASK_ENV') != 'production'
HOST = '0.0.0.0'
PORT = int(os.getenv('PORT', 5000))