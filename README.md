# EyeQ - Exam Management System

EyeQ is a comprehensive exam management system with speech recognition capabilities, built with React frontend and Flask backend, optimized for deployment on Vercel and Render.

## 🏗️ Project Structure

```
EyeQ/
├── frontend/              # React frontend (Vercel deployment)
│   ├── src/
│   │   ├── Components/    # React components
│   │   ├── Pages/         # Page components  
│   │   ├── UI/            # UI components
│   │   ├── Context/       # React contexts
│   │   ├── Routes/        # Routing configuration
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── vercel.json        # Vercel configuration
│   └── README.md          # Frontend documentation
│
├── backend/               # Flask backend (Render deployment)
│   ├── services/          # Service modules
│   │   ├── pdf_utils.py   # PDF validation
│   │   ├── question_service.py # Question extraction
│   │   └── student_service.py  # Student extraction
│   ├── app.py             # Main Flask application
│   ├── config.py          # Configuration
│   ├── requirements.txt   # Python dependencies
│   ├── Procfile          # Render process file
│   ├── runtime.txt       # Python version
│   └── README.md         # Backend documentation
│
├── Client/               # Old frontend folder (can be deleted)
├── Server/               # Old backend folder (can be deleted)
├── api/                  # Legacy API folder (can be deleted)
├── package.json          # Workspace configuration
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Almusavveer/EyeQ.git
cd EyeQ
```

2. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Setup Backend** (in a new terminal)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🌐 Deployment

### Frontend (Vercel)

1. **Connect GitHub to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Configure Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

3. **Deploy**
   - Vercel auto-deploys on git push to main branch
   - Or use Vercel CLI: `vercel --prod`

### Backend (Render)

1. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Connect your GitHub repository
   - Set root directory to `backend`

2. **Configure Build Settings**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Python 3

3. **Set Environment Variables**
   ```bash
   FLASK_ENV=production
   ```

4. **Update CORS Origins**
   - Add your Vercel frontend URL to `backend/config.py`

## 🛠️ Available Scripts

### Root Level
```bash
npm run dev                 # Start frontend development
npm run build              # Build frontend for production
npm run start:frontend     # Start frontend dev server
npm run start:backend      # Start backend dev server
npm run install:frontend   # Install frontend dependencies
npm run install:backend    # Install backend dependencies
npm run deploy:frontend    # Build frontend for deployment
npm run deploy:backend     # Prepare backend for deployment
```

### Frontend (`/frontend`)
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend (`/backend`)
```bash
python app.py     # Start development server
```

## 🔗 API Integration

The frontend communicates with the backend through REST API endpoints:

- **Question Extraction**: `POST /api/upload`
- **Student Extraction**: `POST /api/extract-students`
- **Health Check**: `GET /api/health`

Configure the API URL using the `VITE_API_URL` environment variable.

## 🌟 Features

- **PDF Processing**: Extract questions and student data from PDFs
- **Speech Recognition**: Voice-based exam interactions
- **User Authentication**: Firebase-based authentication
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live exam progress tracking
- **Role Management**: Student and teacher roles
- **Exam Builder**: Create and manage exams
- **Results Dashboard**: View and analyze exam results

## 🔧 Environment Variables

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-app.onrender.com` |

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | `production` |
| `PORT` | Server port | `5000` |

## 📚 Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Firebase** - Authentication
- **Framer Motion** - Animations

### Backend
- **Flask** - Web framework
- **Flask-CORS** - CORS handling
- **PDFPlumber** - PDF text extraction
- **Pillow** - Image processing
- **Gunicorn** - WSGI server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- Report bugs in [GitHub Issues](https://github.com/Almusavveer/EyeQ/issues)
- Check [Frontend README](frontend/README.md) for frontend-specific issues
- Check [Backend README](backend/README.md) for backend-specific issues

## 🔮 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile applications
- [ ] Advanced PDF parsing capabilities
- [ ] Integration with popular LMS platforms