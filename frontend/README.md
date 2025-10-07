# EyeQ Frontend - Vercel Deployment

This is the frontend React application for EyeQ, configured for deployment on Vercel.

## 🚀 Deployment Steps

### Prerequisites
- Node.js 18+ installed
- Vercel account
- Git repository connected to Vercel

### 1. Environment Variables
Before deploying, set up environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:

```bash
VITE_API_URL=https://your-backend-app.onrender.com
```

Replace `your-backend-app` with your actual Render backend URL.

### 2. Automatic Deployment
When you push to your main branch, Vercel will automatically:
1. Install dependencies (`npm install`)
2. Build the project (`npm run build`)
3. Deploy the static files

### 3. Manual Deployment
If you prefer manual deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── Components/        # React components
│   ├── Pages/            # Page components
│   ├── UI/               # UI components
│   ├── Context/          # React contexts
│   ├── Routes/           # Routing configuration
│   └── utils/            # Utility functions
├── package.json          # Dependencies and scripts
├── vercel.json           # Vercel configuration
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

## ⚙️ Configuration Files

### vercel.json
- Configures build settings
- Sets up routing for SPA
- Handles CORS headers

### vite.config.js
- Vite build configuration
- Plugin settings

## 🔗 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-app.onrender.com` |

## 📝 Notes

- The app is built with Vite for fast development and optimized builds
- All routes are handled client-side (SPA configuration)
- CORS is configured to work with the backend API
- Static assets are served from the `public` directory

## 🐛 Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`
- Verify environment variables are set correctly

### Deployment Issues
- Check Vercel build logs for errors
- Ensure environment variables are set in Vercel dashboard
- Verify the backend URL is accessible

### CORS Issues
- Ensure the backend includes your Vercel domain in CORS_ORIGINS
- Check that API requests use the correct base URL+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
