#!/bin/bash
# Production startup script for EyeQ Backend

# Set environment to production
export FLASK_ENV=production

# Load environment variables from .env.production if it exists
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application with gunicorn
exec gunicorn --config gunicorn.conf.py app:app