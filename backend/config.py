# Configuration settings for the Flask application

# CORS settings
CORS_ORIGINS = [
    "https://eye-q-black.vercel.app", 
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174"
]

# File upload settings
MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = ['.pdf']

# Server settings
DEBUG = True
HOST = '0.0.0.0'
PORT = 5000