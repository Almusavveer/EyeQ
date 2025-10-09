# Speech Recognition for EyeQ Exam System

## Overview
The EyeQ exam system includes speech recognition functionality to allow students to answer questions using voice commands. This makes the exam accessible to visually impaired users and provides an alternative input method. **Enhanced with improved pronunciation for technical content.**

## How It Works

### Components
1. **SpeechButton** (`/Client/src/UI/SpeechButton.jsx`)
   - Handles speech recognition input
   - Provides visual feedback during listening
   - Shows error messages if recognition fails
   - Enhanced with better error handling and user feedback

2. **ExamPage** (`/Client/src/Pages/ExamPage.jsx`)
   - Contains the main speech interpretation logic
   - Automatically speaks questions when loaded with **improved pronunciation**
   - Handles voice commands like "repeat"
   - Enhanced interpretation for better answer matching

3. **ConfirmAnswer** (`/Client/src/Components/ConfirmAnswer.jsx`)
   - Confirms the interpreted answer with the user
   - Uses **enhanced speech synthesis** for better pronunciation
   - Listens for "yes" or "no" responses

4. **Speech Utils** (`/Client/src/utils/speechUtils.js`) **NEW**
   - Text preprocessing for better pronunciation
   - Technical term replacements (HTML → H T M L)
   - Enhanced speech synthesis with optimal voice selection
   - Code symbol interpretation (=== → "strict equals")

### Voice Commands

#### Answering Questions
- **Option Numbers**: "Option 1", "Option 2", "Option 3", "Option 4"
- **Letters**: "A", "B", "C", "D"
- **Numbers**: "1", "2", "3", "4"
- **Ordinals**: "First", "Second", "Third", "Fourth"
- **Content**: Speak the actual answer content (partial matching supported)

#### Special Commands
- **"Repeat"** or **"Again"**: Replay the current question
- **"Next"** or **"Skip"**: Skip to next question (if implemented)

#### Confirmation
- **"Yes"**: Confirm the interpreted answer
- **"No"**: Reject and try again

## ✨ **NEW: Pronunciation Improvements**

### Enhanced Text-to-Speech Features
- **Technical Term Processing**: HTML, CSS, JSON, API, etc. are properly spelled out
- **Code Symbol Translation**: `===` becomes "strict equals", `<=` becomes "less than or equal to"
- **Better Option Reading**: "Option 1" becomes "Option number 1" for clarity
- **Slower Speech Rate**: Default 0.8 rate for better comprehension
- **US English Pronunciation**: Better for technical terms than Indian English
- **Smart Pauses**: Enhanced punctuation handling for natural speech flow
- **Voice Selection**: Automatically chooses the best available voice

### Supported Technical Terms
- **Languages**: HTML → "H T M L", CSS → "C S S", JavaScript → "Java Script"
- **Symbols**: `===` → "strict equals", `!=` → "not equals", `&&` → "and"
- **File Extensions**: `.js` → "dot javascript", `.html` → "dot H T M L"
- **Common Words**: `cache` → "cash", `queue` → "cue", `tuple` → "two-pull"

## Features

### Enhanced Recognition
- **Multiple Alternatives**: Gets up to 3 possible interpretations
- **Better Pattern Matching**: More ways to specify answers
- **Content Matching**: Partial matching of answer content
- **Confidence Scoring**: Chooses best match based on confidence

### User Experience
- **Visual Feedback**: Shows listening status and errors
- **Audio Feedback**: Confirms what was understood **with better pronunciation**
- **Error Handling**: Clear error messages for different failure types
- **Manual Fallback**: Manual buttons available as backup
- **Improved Speech Quality**: Technical terms pronounced correctly

### Browser Support
- **Chrome/Edge**: Full support
- **Safari**: Good support
- **Firefox**: Limited support (recommendation to use Chrome/Edge)

## Usage Instructions for Students

1. **Enable Microphone**: Allow microphone access when prompted
2. **Click "Speak Answer"**: The button will turn red and show "Stop Listening"
3. **Speak Clearly**: Say your answer clearly and at normal pace
4. **Wait for Confirmation**: The system will repeat what it heard
5. **Confirm or Reject**: Say "yes" to confirm or "no" to try again

### Tips for Better Recognition
- Speak in a quiet environment
- Use clear pronunciation
- Speak at normal pace (not too fast or slow)
- Use structured commands like "Option 1" for best results
- If recognition fails, try using more specific terms

## Troubleshooting

### Common Issues
1. **"Speech recognition not supported"**
   - Use Chrome, Edge, or Safari browser
   - Ensure you're on HTTPS (required for speech recognition)

2. **"No microphone found"**
   - Check microphone is connected and working
   - Check browser permissions for microphone access

3. **"Microphone access denied"**
   - Allow microphone access in browser settings
   - Refresh the page and try again

4. **Recognition not accurate**
   - Speak more clearly and slowly
   - Use structured commands like "Option 1"
   - Try saying the answer content directly
   - Ensure quiet environment

### Debug Information
When in development mode, check the browser console for:
- "Speech recognition started"
- "Speech result: [transcript] Confidence: [score]"
- "Speech interpretation: [analysis]"

## Technical Details

### Speech Recognition Configuration
```javascript
recognition.lang = "en-IN";           // Indian English
recognition.interimResults = false;   // Only final results
recognition.maxAlternatives = 3;      // Get multiple options
recognition.continuous = false;       // Single utterance
```

### Speech Synthesis Configuration **NEW**
```javascript
// Enhanced speech synthesis with preprocessing
await speakText("What is HTML used for?", {
  rate: 0.8,        // Slower for comprehension
  pitch: 1,         // Normal pitch
  volume: 1,        // Full volume
  lang: 'en-US'     // US English for technical terms
});

// Automatic preprocessing:
// "HTML" → "H T M L"
// "What is H T M L used for?"
```

### Text Preprocessing Examples
```javascript
// Before preprocessing
"What is the time complexity O(log n) for binary search?"

// After preprocessing  
"What is the time complexity O of log n for binary search?"

// Code symbols
"if (x === y)" → "if of x strict equals y of"

// Technical terms
"JSON API response" → "Jason A P I response"
```

### Answer Interpretation Logic
The system uses multiple matching strategies:
1. **Exact Pattern Match** (100% confidence)
2. **Contains Pattern** (50% confidence) 
3. **Word Content Match** (15-30% confidence)

### Accessibility Features
- Automatic question reading
- Voice confirmation of understood answers
- Clear error messages and guidance
- Visual indicators for speech status
- Manual button fallbacks

---

This implementation provides a robust speech recognition system specifically designed for exam environments, with enhanced error handling and user feedback to ensure reliable voice-based interaction.