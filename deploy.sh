#!/bin/bash

# EyeQ Deployment Helper Script

echo "🚀 EyeQ Deployment Helper"
echo "========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to deploy frontend
deploy_frontend() {
    echo "📦 Preparing frontend for deployment..."
    cd frontend
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    npm install
    
    # Build for production
    echo "🔨 Building for production..."
    npm run build
    
    # Check if build was successful
    if [ $? -eq 0 ]; then
        echo "✅ Frontend build successful!"
        echo "📝 Next steps:"
        echo "   1. Push your changes to GitHub"
        echo "   2. Vercel will automatically deploy from your main branch"
        echo "   3. Set VITE_API_URL environment variable in Vercel dashboard"
    else
        echo "❌ Frontend build failed!"
        exit 1
    fi
    
    cd ..
}

# Function to prepare backend
prepare_backend() {
    echo "🐍 Preparing backend for deployment..."
    cd backend
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        echo "❌ Error: requirements.txt not found"
        exit 1
    fi
    
    # Check if Procfile exists
    if [ ! -f "Procfile" ]; then
        echo "❌ Error: Procfile not found"
        exit 1
    fi
    
    echo "✅ Backend is ready for deployment!"
    echo "📝 Next steps:"
    echo "   1. Push your changes to GitHub"
    echo "   2. Create a new Web Service on Render"
    echo "   3. Connect your GitHub repository"
    echo "   4. Set root directory to 'backend'"
    echo "   5. Configure environment variables in Render dashboard"
    
    cd ..
}

# Function to update CORS origins
update_cors() {
    echo "🔧 Updating CORS configuration..."
    
    read -p "Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): " frontend_url
    
    if [ ! -z "$frontend_url" ]; then
        # Create a backup of config.py
        cp backend/config.py backend/config.py.backup
        
        # Add the frontend URL to CORS_ORIGINS (simplified approach)
        echo "📝 Please manually add '$frontend_url' to CORS_ORIGINS in backend/config.py"
        echo "💡 Tip: Look for the CORS_ORIGINS list and add your URL"
    else
        echo "❌ No URL provided, skipping CORS update"
    fi
}

# Main menu
echo "Please select an option:"
echo "1) Deploy frontend (build and prepare)"
echo "2) Prepare backend for deployment"
echo "3) Update CORS configuration"
echo "4) Deploy both frontend and backend"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_frontend
        ;;
    2)
        prepare_backend
        ;;
    3)
        update_cors
        ;;
    4)
        deploy_frontend
        echo ""
        prepare_backend
        echo ""
        update_cors
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-5."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment preparation complete!"
echo "📚 For detailed instructions, check the README files in frontend/ and backend/ directories"