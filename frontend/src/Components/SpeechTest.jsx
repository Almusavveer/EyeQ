// Speech Test Component - For testing pronunciation improvements
// Client/src/Components/SpeechTest.jsx

import React, { useState } from 'react';
import { speakText, getAvailableVoices } from '../utils/speechUtils';

const SpeechTest = () => {
  const [testText, setTestText] = useState('What is the time complexity of binary search in a sorted array?');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  React.useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const testSpeech = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      const voice = voices.find(v => v.name === selectedVoice);
      
      await speakText(testText, {
        rate: 0.8,
        pitch: 1,
        volume: 1,
        lang: 'en-US',
        voice: voice
      });
    } catch (error) {
      console.error('Speech test failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const testCases = [
    'What is HTML and CSS used for in web development?',
    'Which JavaScript function is used for AJAX requests?',
    'Option 1: O(n), Option 2: O(log n), Option 3: O(n²), Option 4: O(1)',
    'The JSON format is used for API responses.',
    'SQL queries are used to access database records.',
    'const myVariable = "Hello World";',
    'if (x === y) { return true; } else { return false; }'
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Speech Pronunciation Test</h2>
      
      {/* Voice Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Voice:
        </label>
        <select 
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {voices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang}) {voice.localService ? '(Local)' : '(Online)'}
            </option>
          ))}
        </select>
      </div>

      {/* Test Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Text:
        </label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
          placeholder="Enter text to test pronunciation..."
        />
      </div>

      {/* Test Button */}
      <button
        onClick={testSpeech}
        disabled={isPlaying || !testText}
        className={`w-full py-3 px-4 rounded-md font-medium ${
          isPlaying 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isPlaying ? '🔊 Speaking...' : '🎤 Test Speech'}
      </button>

      {/* Quick Test Cases */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Quick Test Cases:</h3>
        <div className="grid gap-2">
          {testCases.map((text, idx) => (
            <button
              key={idx}
              onClick={() => setTestText(text)}
              className="text-left p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Speech Settings Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Pronunciation Improvements:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Technical terms like HTML, CSS, JSON are spelled out</li>
          <li>• Code symbols like === become "strict equals"</li>
          <li>• Options are read as "Option number 1, Option number 2"</li>
          <li>• Slower speech rate (0.8) for better comprehension</li>
          <li>• US English for better technical term pronunciation</li>
          <li>• Enhanced pauses after punctuation</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechTest;

