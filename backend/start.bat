@echo off
REM Production startup script for EyeQ Backend (Windows)

REM Set environment to production
set FLASK_ENV=production

REM Load environment variables from .env.production if it exists
if exist .env.production (
    for /f "tokens=*" %%i in (.env.production) do set %%i
)

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Start the application with gunicorn
gunicorn --config gunicorn.conf.py app:app