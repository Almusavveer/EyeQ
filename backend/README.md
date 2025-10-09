# EyeQ Backend - Flask API Documentation

This is the Flask backend API for EyeQ, configured for deployment on Render.

## 🚀 Production Deployment (Render)

### Environment Variables Required:

**Production (Render):**
```bash
FLASK_ENV=production
PORT=10000  # Auto-set by Render
PYTHON_VERSION=3.11.0
```

**Development (Local):**
```bash
FLASK_ENV=development
PORT=5000
```

### Server Configuration:

- **Development**: Uses Flask's built-in server with debug mode enabled
- **Production**: Uses Gunicorn WSGI server (configured in Procfile)
- **CORS**: Configured for both production and development environments
- **File Uploads**: Limited to 10MB PDF files

### Running the Server:

**Development:**
```bash
cd backend
python app.py
```

**Production (via Gunicorn):**
```bash
cd backend
gunicorn app:app
```

### Health Check:
- **Endpoint**: `GET /health`
- **Returns**: `{"status": "healthy", "message": "PDF processing service is running"}`

## 📁 Key Configuration Files:

1. **app.py** - Main Flask application with startup logging
2. **config.py** - CORS and debug configuration settings
3. **Procfile** - Render deployment configuration (`web: gunicorn app:app`)
4. **requirements.txt** - Python dependencies

## 🌐 CORS Configuration:

CORS is configured to allow requests from:
- **Production**: `https://eye-q-app.vercel.app`
- **Development**: `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`

## 🚀 Deployment Steps

### Prerequisites
- Python 3.11+
- Render account
- Git repository connected to Render

### 1. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the backend folder or set the root directory to `backend`
5. Configure the following settings:

**Basic Settings:**
- **Name**: `eyeq-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` (if repo contains both frontend and backend)
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app` (or `python app.py` for development)

### 2. Environment Variables

In Render dashboard, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `FLASK_ENV` | `production` | Sets Flask to production mode |
| `PORT` | (auto-set by Render) | Port for the application |
| `PYTHON_VERSION` | `3.11.0` | Python version |

### 3. Custom Domain (Optional)

1. In Render dashboard, go to Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed
4. Update CORS_ORIGINS in `config.py` with your domain

## 🛠️ Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

The server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── services/              # Service modules
│   ├── __init__.py
│   ├── pdf_utils.py      # PDF validation utilities
│   ├── question_service.py # Question extraction logic
│   └── student_service.py  # Student extraction logic
├── app.py                # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── Procfile             # Process file for deployment
├── runtime.txt          # Python version specification
└── README.md            # This file
```

## 🔧 Configuration

### config.py
- CORS origins configuration
- File upload settings
- Server settings
- Environment-based configuration

### CORS Configuration
Update `CORS_ORIGINS` in `config.py` to include your frontend domains:

```python
CORS_ORIGINS = [
    "https://your-frontend.vercel.app",  # Your Vercel frontend
    "http://localhost:5173",             # Local development
    # Add other allowed origins
]
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Extract questions from PDF |
| POST | `/api/extract-students` | Extract students from PDF |
| GET | `/api/health` | Health check endpoint |

## 🔍 API Documentation

### Upload PDF for Question Extraction
```bash
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: PDF file containing questions
```

### Extract Students from PDF
```bash
POST /api/extract-students
Content-Type: multipart/form-data

Body:
- file: PDF file containing student data
```

### Health Check
```bash
GET /api/health
```

## 🐛 Troubleshooting

### Build Issues
- Check Python version matches `runtime.txt`
- Verify all dependencies are in `requirements.txt`
- Check for missing system dependencies

### Runtime Issues
- Check Render logs for error details
- Verify environment variables are set correctly
- Ensure port binding is correct (`0.0.0.0:PORT`)

### CORS Issues
- Add frontend domain to `CORS_ORIGINS` in `config.py`
- Verify the frontend is making requests to correct backend URL
- Check preflight OPTIONS requests are handled

### PDF Processing Issues
- Ensure PDF files are valid and not corrupted
- Check file size limits (currently 10MB)
- Verify PDF contains expected text format

## 🔒 Security Notes

- File uploads are validated for type and size
- CORS is configured for specific origins only
- Error handling prevents sensitive information leakage
- Use HTTPS in production (handled by Render)

## 📈 Performance Optimization

- Use gunicorn for production WSGI server
- Configure worker processes based on traffic
- Implement caching for repeated PDF processing
- Consider file upload to cloud storage for large files