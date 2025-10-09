# Configuration settings for the Flask application
import os

<<<<<<< HEAD
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
        "https://eyeqapp.vercel.app",
        # Add any other production domains here
    ]
else:
    CORS_ORIGINS = [
        "https://eyeqapp.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175"
    ]
=======
# CORS settings - Production domain only
CORS_ORIGINS = [
    "https://eye-q-app.vercel.app"
]
>>>>>>> parent of 94c2007 ( Production ready: Clean logs, fix student verification, add security)

# File upload settings
MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = ['.pdf']

# Server settings
DEBUG = os.getenv('FLASK_ENV') != 'production'
HOST = '0.0.0.0'
PORT = int(os.getenv('PORT', 5000))