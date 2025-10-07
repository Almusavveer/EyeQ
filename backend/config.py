# Configuration settings for the Flask application
import os

# CORS settings - Add your Vercel domain here
CORS_ORIGINS = [
    "https://eye-q-black.vercel.app", 
    "https://your-app-name.vercel.app",  # Replace with your actual Vercel domain
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174"
]

# File upload settings
MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = ['.pdf']

# Server settings
DEBUG = os.getenv('FLASK_ENV') != 'production'
HOST = '0.0.0.0'
PORT = int(os.getenv('PORT', 5000))