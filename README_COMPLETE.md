# EyeQ - Voice-Enabled Exam System for Blind Students

## 🎯 Project Overview

EyeQ is a comprehensive web-based examination platform specifically designed to provide equal access to education for visually impaired students. The system features advanced voice interaction capabilities, allowing blind students to take exams using speech commands and audio feedback, making the assessment process fully accessible and independent.

### 🌟 Key Features

- **Voice-Enabled Interface**: Complete voice control for navigation and answering
- **Real-time Speech Recognition**: Supports multiple voice commands (A, B, C, D answers)
- **Audio Question Reading**: Automatic text-to-speech for questions and options
- **Answer Review System**: Voice confirmation and change options for answers
- **Timer Management**: Voice-controlled exam timing with accessibility features
- **Student Verification**: Secure identity verification system
- **Teacher Dashboard**: Comprehensive result management and analytics
- **Auto-save Functionality**: Prevents data loss during exams
- **Responsive Design**: Works across different devices and screen readers

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern component-based UI framework
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing for SPA navigation
- **Firebase** - Backend-as-a-Service for authentication and database
- **Web Speech API** - Browser-native speech recognition and synthesis
- **React Hooks** - Modern state management and side effects

### Backend
- **Firebase Firestore** - NoSQL database for exam data and results
- **Firebase Authentication** - User authentication and authorization
- **Flask** - Python web framework for PDF processing
- **PyPDF2** - PDF parsing and text extraction

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **Custom Hooks** - Reusable logic extraction for maintainability

## 📁 Complete Project Structure & File Explanations

```
EyeQ-master/
├── .gitignore                          # Git ignore rules (node_modules, env files)
├── README.md                           # This comprehensive project documentation
├── TODO.md                             # Development task tracking
├── SPEECH_RECOGNITION.md              # Voice recognition implementation notes
├── quiz1.pdf & quiz2.pdf              # Sample quiz files for testing
│
├── Client/                             # React Frontend Application
│   ├── .env                            # Environment variables (Firebase config)
│   ├── .prettierrc                    # Code formatting configuration
│   ├── eslint.config.js               # ESLint configuration for code quality
│   ├── package.json                   # Dependencies and npm scripts
│   │   ├── scripts:                   # Available commands
│   │   │   ├── "dev": "vite"         # Start development server
│   │   │   ├── "build": "vite build" # Production build
│   │   │   ├── "lint": "eslint ."    # Code linting
│   │   │   └── "preview": "vite preview" # Preview production build
│   │   └── dependencies:              # Key packages explained below
│   │       ├── "react": "^19.1.1"     # Core React library
│   │       ├── "react-dom": "^19.1.1" # React DOM rendering
│   │       ├── "react-router-dom": "^7.9.2" # Client-side routing
│   │       ├── "firebase": "^12.1.0" # Firebase SDK for auth & database
│   │       ├── "react-firebase-hooks": "^5.1.1" # Firebase React hooks
│   │       ├── "tailwindcss": "^4.1.12" # Utility-first CSS framework
│   │       ├── "framer-motion": "^12.23.12" # Animation library
│   │       └── "react-icons": "^5.5.0" # Icon library
│   ├── package-lock.json              # Exact dependency versions lockfile
│   ├── vercel.json                    # Vercel deployment configuration
│   ├── vite.config.js                 # Vite build tool configuration
│   ├── README.md                      # Client-specific documentation
│   ├── dist/                          # Production build output (generated)
│   ├── node_modules/                  # Installed dependencies (generated)
│   ├── public/                        # Static assets served directly
│   │   ├── favicon.ico               # Browser tab icon
│   │   └── manifest.json             # PWA configuration
│   └── src/                           # Main application source code
│       ├── App.jsx                   # Root React component with AuthProvider
│       │   ├── Purpose: Main app wrapper with authentication context
│       │   ├── Features: Global auth state, routing setup, base styling
│       │   ├── Dependencies: AuthProvider, AppRoutes, Tailwind CSS
│       │   └── Code Structure:
│       │       - AuthProvider wraps entire app
│       │       - AppRoutes handles all navigation
│       │       - Minimal styling with Tailwind classes
│       │
│       ├── main.jsx                  # Application entry point
│       │   ├── Purpose: Mounts React app to DOM with StrictMode
│       │   ├── Features: BrowserRouter setup for client-side routing
│       │   ├── Renders: App component inside routing context
│       │   └── Why StrictMode: Catches potential issues in development
│       │
│       ├── index.css                 # Global CSS styles and Tailwind imports
│       ├── firebase.js               # Firebase configuration and initialization
│       │   ├── Purpose: Central Firebase setup for auth and database
│       │   ├── Exports: auth (Firebase Auth), db (Firestore)
│       │   ├── Security: Uses environment variables for API keys
│       │   └── Configuration: API keys loaded from .env file
│       │
│       ├── data.js                   # Static data and constants
│       │   └── Purpose: Mock data for development and testing
│       │
│       ├── Components/               # Reusable UI Components
│       │   ├── AnswerList.jsx        # Display list of answer options
│       │   ├── ConfirmAnswer.jsx     # Answer confirmation dialog
│       │   ├── PasswordReset.jsx     # Password reset functionality
│       │   ├── ProtectedRoute.jsx    # Route guard for authenticated users
│       │   │   ├── Purpose: Redirects unauthenticated users to login
│       │   │   ├── Logic: Checks auth state, shows loading, redirects if needed
│       │   │   ├── Usage: Wraps protected pages in AppRoutes.jsx
│       │   │   └── Dependencies: useAuth hook from AuthContext
│       │   ├── PublishStep.jsx       # Exam publishing workflow step
│       │   ├── ReviewStep.jsx        # Exam review and editing step
│       │   ├── SpeechTest.jsx        # Voice recognition testing component
│       │   ├── Exam/                 # Exam-specific components
│       │   │   ├── ExamHeader.jsx    # Header with student info and timer
│       │   │   │   ├── Purpose: Displays exam title, student name, timer
│       │   │   │   ├── Features: Real-time countdown, responsive design
│       │   │   │   ├── Used in: ExamPage.jsx main layout
│       │   │   │   └── Props: studentName, studentId, examTitle, examDuration, timerStarted
│       │   │   ├── ExamFooter.jsx    # Navigation and submit buttons
│       │   │   │   ├── Purpose: Previous/Next navigation, submit exam
│       │   │   │   ├── Features: Voice-compatible button states
│       │   │   │   ├── Logic: Handles exam submission with validation
│       │   │   │   └── Props: onNext, onPrev, onSubmit, currentQuestionId, totalQuestions
│       │   │   ├── ExamVoiceStatus.jsx # Voice status indicator
│       │   │   │   ├── Purpose: Shows current voice interaction state
│       │   │   │   ├── States: listening, confirming, reviewing, etc.
│       │   │   │   ├── Features: Visual feedback for voice commands
│       │   │   │   └── Props: speechSupported, voiceStep, isListening
│       │   │   ├── NavigationPanel.jsx # Question navigation grid
│       │   │   │   ├── Purpose: Grid of question numbers for navigation
│       │   │   │   ├── Features: Visual indicators for answered/flagged
│       │   │   │   ├── Interaction: Click to jump to specific questions
│       │   │   │   └── Props: questions, currentQuestionId, onNavigateToQuestion
│       │   │   ├── QuestionPanel.jsx # Question display and options
│       │   │   │   ├── Purpose: Shows current question and answer choices
│       │   │   │   ├── Features: Option selection, visual feedback
│       │   │   │   └── Props: question, onAnswer
│       │   │   ├── StudentVerification.jsx # Identity verification
│       │   │   │   ├── Purpose: Student login with ID verification
│       │   │   │   ├── Features: Session management, exam access control
│       │   │   │   ├── Security: Prevents unauthorized exam access
│       │   │   │   └── Props: onVerified, examId
│       │   │   ├── TimerDisplay.jsx   # Exam timer component
│       │   │   └── QuestionNavigation.jsx # Alternative navigation
│       │   ├── Home/                  # Homepage components
│       │   ├── Login/                 # Authentication components
│       │   ├── Register/              # User registration components
│       │   ├── PdfUpload/             # PDF file upload components
│       │   └── Review/                # Exam review components
│       │
│       ├── Pages/                     # Page-level components (full screens)
│       │   ├── HomePage.jsx          # Landing page for all users
│       │   ├── Home.jsx              # Authenticated user dashboard
│       │   ├── ExamPage.jsx          # Main exam taking interface
│       │   │   ├── Purpose: Complete exam experience for students
│       │   │   ├── Features: Voice integration, question navigation
│       │   │   ├── Hooks used: useExamVoice, useExamData, useStudentVerification
│       │   │   ├── Components: ExamHeader, QuestionPanel, NavigationPanel, ExamFooter
│       │   │   └── State management: Questions, current question, timer
│       │   ├── ExamBuilder.jsx       # Teacher exam creation interface
│       │   ├── ReviewEdit.jsx        # Exam review and editing page
│       │   ├── Role.jsx              # User role selection (student/teacher)
│       │   ├── StudentManager.jsx    # Student management dashboard
│       │   ├── TeacherResults.jsx    # Teacher results viewing page
│       │   ├── ExamSubmitted.jsx     # Post-exam confirmation page
│       │   ├── StudentResultDetail.jsx # Individual student results
│       │   └── Result.jsx            # General results display
│       │
│       ├── Routes/                    # Application routing configuration
│       │   └── AppRoutes.jsx         # Central route definitions
│       │       ├── Purpose: Defines all application routes and protection
│       │       ├── Structure: Public routes (login/register) and protected routes
│       │       ├── Protection: Uses ProtectedRoute for authenticated pages
│       │       └── Routes defined:
│       │           ├── "/": HomePage (public)
│       │           ├── "/role": Role selection (public)
│       │           ├── "/exam/:examId": ExamPage (public, but verified)
│       │           ├── "/login": Login (public)
│       │           ├── "/register": Register (public)
│       │           ├── "/home": Home (protected)
│       │           ├── "/exambuilder": ExamBuilder (protected)
│       │           ├── "/students": StudentManager (protected)
│       │           ├── "/review/:examId": ReviewEdit (protected)
│       │           ├── "/results/:examId": TeacherResults (protected)
│       │           ├── "/exam-submitted": ExamSubmitted (public)
│       │           └── "/result-detail": StudentResultDetail (public)
│       │
│       ├── Context/                   # React Context for global state
│       │   └── AuthContext.jsx       # Authentication state management
│       │       ├── Purpose: Provides auth state throughout the app
│       │       ├── Hook: useAuth() for accessing auth state
│       │       ├── State: user, loading, error, isAuthenticated
│       │       ├── Provider: Wraps entire app in App.jsx
│       │       └── Dependencies: react-firebase-hooks for auth state
│       │
│       ├── hooks/                     # Custom React hooks (logic extraction)
│       │   ├── useExamVoice.js       # Voice functionality and speech recognition
│       │   │   ├── Purpose: Manages all voice interactions and commands
│       │   │   ├── Features: Speech recognition, text-to-speech, command processing
│       │   │   ├── State: voiceStep, isListening, speechSupported
│       │   │   ├── Functions: startVoiceInput, handleNavigation, handleNavigateToQuestion
│       │   │   └── Logic: Answer selection, navigation, confirmation flows
│       │   ├── useExamData.js        # Exam data fetching and persistence
│       │   │   ├── Purpose: Handles exam loading, saving, and state management
│       │   │   ├── Features: Auto-save, available exams fetching
│       │   │   ├── Firebase: Reads from examDetails, writes to studentAnswers
│       │   │   ├── State: questions, examTitle, examDuration, loading, error
│       │   │   └── Auto-save: Debounced saving every 1 second
│       │   └── useStudentVerification.js # Student verification logic
│       │       ├── Purpose: Manages student identity verification and sessions
│       │       ├── Features: Session storage, expiry checking, exam validation
│       │       ├── Security: Prevents retakes, validates exam access
│       │       ├── State: studentName, studentId, isVerified
│       │       └── Session: 1-hour verification validity
│       │
│       ├── UI/                       # Shared UI components and utilities
│       └── utils/                    # Utility functions and helpers
│           └── speechUtils.js        # Speech synthesis helper functions
│               └── Functions: speakText() for text-to-speech
│
└── Server/                           # Python Flask Backend for PDF Processing
    ├── app.py                       # Main Flask application
    │   ├── Purpose: REST API for PDF processing and data extraction
    │   ├── Routes:
    │   │   ├── /api/extract-students: Extract student data from PDFs
    │   │   │   ├── Method: POST (multipart/form-data)
    │   │   │   ├── Input: PDF file with student list
    │   │   │   ├── Output: JSON array of student objects
    │   │   │   └── Validation: File type, size, content checks
    │   │   ├── /api/upload: Extract questions from exam PDFs
    │   │   │   ├── Method: POST (multipart/form-data)
    │   │   │   ├── Input: PDF file with exam questions
    │   │   │   ├── Output: JSON array of question objects
    │   │   │   └── Processing: Text extraction, question parsing
    │   │   └── /api/health: Service health check
    │   │       ├── Method: GET
    │   │       ├── Output: JSON status message
    │   │       └── Purpose: Monitoring and load balancer health checks
    │   ├── Features: CORS support, error handling, file validation
    │   ├── Services: pdf_utils, student_service, question_service
    │   └── Error Handling: 400 (bad request), 404 (not found), 500 (server error)
    │
    ├── app_backup.py                # Backup version of main app
    ├── app_new.py                   # Development version
    ├── config.py                    # Configuration settings
    │   ├── CORS_ORIGINS: List of allowed frontend URLs
    │   ├── DEBUG: Development mode flag
    │   ├── HOST: Server host (default: localhost)
    │   └── PORT: Server port (default: 5000)
    ├── models.py                    # Data models (if any)
    ├── requirements.txt             # Python dependencies
    │   ├── Flask==2.3.3            # Web framework
    │   ├── flask-cors==4.0.0       # CORS support
    │   ├── PyPDF2==3.0.1           # PDF processing
    │   └── Other dependencies for PDF parsing
    ├── requirements_new.txt         # Updated dependencies
    ├── __pycache__/                 # Python bytecode cache
    └── services/                    # Business logic services
        ├── __init__.py             # Package initialization
        ├── pdf_utils.py            # PDF file validation and processing
        │   ├── validate_pdf_file(): File type, size, corruption checks
        │   └── Helper functions for PDF text extraction
        ├── question_service.py     # Question extraction from PDFs
        │   ├── extract_questions_from_pdf(): Main extraction logic
        │   └── Parsing logic for different question formats
        └── student_service.py      # Student data extraction
            ├── extract_students_from_pdf(): Student list parsing
            └── Data validation and formatting
```

## 🔧 Code Architecture & Design Decisions

### 1. Custom Hooks Architecture

#### Why Custom Hooks?
- **Separation of Concerns**: Extracted complex logic from components
- **Reusability**: Hooks can be shared across multiple components
- **Testability**: Isolated logic is easier to unit test
- **Maintainability**: Changes to logic don't affect UI components

#### `useExamVoice.js` - Voice Functionality Hook
```javascript
// Handles all voice-related operations
const useExamVoice = ({ currentQuestion, handleAnswer, ... }) => {
    // Speech recognition setup
    // Voice command processing
    // Question speaking logic
    // Navigation with answer review
    return { speechSupported, voiceStep, startVoiceInput, ... };
};
```

**Why this approach?**
- Voice logic is complex and stateful
- Centralizes all speech recognition code
- Makes the main component cleaner and focused on UI
- Easier to modify voice behavior without touching UI

#### `useExamData.js` - Data Management Hook
```javascript
// Manages exam data fetching and persistence
const useExamData = (examId, isVerified, ...) => {
    // Firebase data fetching
    // Auto-save functionality
    // Available exams loading
    return { availableExams, showExamSelection, ... };
};
```

**Why this approach?**
- Data fetching logic separated from UI
- Auto-save prevents data loss
- Centralized error handling for data operations

#### `useStudentVerification.js` - Verification Hook
```javascript
// Handles student identity verification
const useStudentVerification = (examId) => {
    // Session storage management
    // Verification expiry checking
    // Exam submission validation
    return { studentName, studentId, isVerified, ... };
};
```

**Why this approach?**
- Verification logic is security-critical
- Session persistence across page refreshes
- Prevents exam retakes after submission

### 2. Component Architecture

#### Atomic Design Principles
- **Components**: Small, reusable UI pieces (buttons, inputs)
- **Pages**: Full page layouts combining components
- **Hooks**: Logic extraction for complex operations

#### `ExamPage.jsx` - Main Exam Component
```javascript
const ExamPage = () => {
    // Uses multiple hooks for different concerns
    const voiceHook = useExamVoice({...});
    const dataHook = useExamData({...});
    const verificationHook = useStudentVerification(examId);

    // Focuses only on UI composition and event handling
    return (
        <ExamHeader {...} />
        <ExamVoiceStatus {...} />
        <QuestionPanel {...} />
        // ...
    );
};
```

**Why this structure?**
- Main component stays focused on UI composition
- Complex logic delegated to specialized hooks
- Easier to understand component hierarchy
- Better performance through selective re-renders

### 3. Voice Interaction Design

#### Speech Recognition Implementation
```javascript
// Web Speech API integration
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';
```

**Why Web Speech API?**
- Native browser support (no external dependencies)
- Works offline for basic functionality
- Consistent across modern browsers
- Lower latency than server-based solutions

#### Voice Command Processing
```javascript
const handleVoiceResult = (transcript) => {
    const answerMap = {
        'a': 0, 'option a': 0, 'first': 0,
        'b': 1, 'option b': 1, 'second': 1,
        // ... multiple synonyms for robustness
    };
    const optionIndex = answerMap[transcript.toLowerCase()];
};
```

**Why multiple synonyms?**
- Users might say "A", "option A", "first option", "choice A"
- Improves recognition accuracy and user experience
- Handles natural language variations

#### Answer Review System
```javascript
// When navigating to answered questions
if (currentQuestion.answer !== null) {
    speakText(`Your current answer is ${answerLetter}: ${answerText}`);
    speakText("Do you want to change your answer? Say yes or no.");
    setVoiceStep('review_answer');
}
```

**Why answer review?**
- Prevents accidental navigation without reviewing answers
- Gives students control over their responses
- Follows accessibility best practices for confirmation

### 4. Data Persistence Strategy

#### Firebase Firestore Structure
```
examDetails/{examId}/
├── questions: [...]           # Exam questions and options
├── studentAnswers/{studentId}/ # Individual student answers
│   ├── answers: [...]
│   ├── flagged: [...]
│   └── lastUpdated: timestamp

examResults/{examId}/submissions/{studentId}/
├── answers: [...]            # Final submitted answers
├── attemptedQuestions: number
├── submittedAt: timestamp
└── studentInfo: {...}
```

**Why this structure?**
- **Real-time sync**: Students can resume exams from any device
- **Auto-save**: Prevents data loss during network issues
- **Teacher access**: Separate collection for grading and analytics
- **Security**: Proper data isolation between students

#### Auto-save Implementation
```javascript
useEffect(() => {
    const saveAnswers = async () => {
        // Save to Firebase with debouncing
    };
    const timeoutId = setTimeout(saveAnswers, 1000);
    return () => clearTimeout(timeoutId);
}, [questions]);
```

**Why debounced auto-save?**
- Reduces Firebase write operations
- Prevents excessive API calls during rapid changes
- Balances data safety with performance

### 5. Accessibility-First Design

#### Voice-Only Navigation
- **Keyboard support**: Arrow keys for navigation
- **Screen reader compatibility**: Proper ARIA labels
- **Voice feedback**: Every action confirmed through speech
- **Error handling**: Clear voice messages for failures

#### Visual Design for Blind Users
- **High contrast**: Clear visual indicators for screen readers
- **Large touch targets**: Easy interaction for motor impairments
- **Consistent layout**: Predictable navigation patterns
- **Status indicators**: Visual feedback for voice states

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Python 3.8+ (for backend)
- Firebase project with Firestore enabled

### Frontend Setup
1. **Install dependencies**
   ```bash
   cd Client
   npm install
   ```

2. **Configure Firebase**
   ```javascript
   // Create .env file with Firebase config
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   // ... other Firebase config variables
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Backend Setup
1. **Install Python dependencies**
   ```bash
   cd Server
   pip install -r requirements.txt
   ```

2. **Configure CORS origins**
   ```python
   # config.py
   CORS_ORIGINS = ["http://localhost:5173"]  # Frontend dev server
   ```

3. **Start Flask server**
   ```bash
   python app.py
   ```

## 📖 Usage Guide

### For Students
1. **Login/Register**: Create account or sign in
2. **Verification**: Complete identity verification
3. **Exam Selection**: Choose from available exams
4. **Voice Instructions**: Listen to welcome message and instructions
5. **Take Exam**: Use voice commands to navigate and answer
6. **Submit**: Complete exam and view results

### Voice Commands
- **"A", "B", "C", "D"**: Select answer options
- **"Confirm"**: Accept selected answer
- **"Change"**: Modify current answer
- **"Yes/No"**: Answer review questions
- **Arrow Keys**: Navigate between questions

### For Teachers
1. **Create Exams**: Add questions and set duration
2. **Monitor Progress**: View student submissions
3. **Grade Exams**: Access detailed results
4. **Analytics**: Review performance statistics

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **Session Management**: Time-limited verification sessions
- **Data Encryption**: Firebase's built-in encryption
- **Access Control**: Role-based permissions (student/teacher)
- **Exam Integrity**: Prevents multiple submissions

## 🎯 Key Achievements

### Accessibility Innovation
- **First-of-its-kind**: Voice-enabled exam system for blind students
- **Comprehensive coverage**: All exam features accessible via voice
- **User testing**: Designed with input from visually impaired students

### Technical Excellence
- **Modern architecture**: React hooks and functional components
- **Performance optimized**: Efficient state management and rendering
- **Scalable design**: Firebase backend supports multiple institutions

### Educational Impact
- **Equal opportunity**: Removes barriers for visually impaired students
- **Independent testing**: Students can take exams without assistance
- **Confidence building**: Empowers students with technology

## 🔮 Future Enhancements

- **Multi-language support**: Additional language options
- **Mobile app**: Native iOS/Android applications
- **Advanced analytics**: Detailed performance insights
- **Offline mode**: Limited functionality without internet
- **Integration APIs**: Connect with existing LMS systems

## 👥 Contributing

This project was developed as part of an accessibility initiative to make education more inclusive. The codebase follows modern React best practices and is open for contributions to further improve accessibility features.

## 📄 License

This project is developed for educational purposes and accessibility advocacy. Please contact the development team for usage permissions and collaboration opportunities.

---

**EyeQ** - Making Education Accessible for Everyone 🎓
