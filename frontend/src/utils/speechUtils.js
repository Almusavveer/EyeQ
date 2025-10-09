// Speech Utility for Better Pronunciation
// Client/src/utils/speechUtils.js

/**
 * Preprocesses text to improve text-to-speech pronunciation
 * @param {string} text - The text to be spoken
 * @param {object} options - Speech options
 * @returns {string} - Processed text with better pronunciation
 */
export const preprocessTextForSpeech = (text, options = {}) => {
  if (!text || typeof text !== 'string') return '';
  
  let processedText = text;
  
  // Replace common technical terms with phonetic versions
  const replacements = {
    // Programming terms
    'HTML': 'H T M L',
    'CSS': 'C S S',
    'JavaScript': 'Java Script',
    'JS': 'Java Script',
    'API': 'A P I',
    'URL': 'U R L',
    'HTTP': 'H T T P',
    'HTTPS': 'H T T P S',
    'JSON': 'Jason',
    'XML': 'X M L',
    'SQL': 'S Q L',
    'PHP': 'P H P',
    'IDE': 'I D E',
    'UI': 'User Interface',
    'UX': 'User Experience',
    'DOM': 'D O M',
    'AJAX': 'Ajax',
    'REST': 'Rest',
    'CRUD': 'C R U D',
    'OOP': 'Object Oriented Programming',
    
    // Data structures and algorithms
    'JSON': 'Jason',
    'Array': 'Array',
    'Object': 'Object',
    'String': 'String',
    'Integer': 'Integer',
    'Boolean': 'Boolean',
    'Null': 'Null',
    'Undefined': 'Undefined',
    
    // Common abbreviations
    'e.g.': 'for example',
    'i.e.': 'that is',
    'etc.': 'etcetera',
    'vs.': 'versus',
    'vs': 'versus',
    
    // Numbers and options - make them clearer
    'Option 1': 'Option number 1',
    'Option 2': 'Option number 2', 
    'Option 3': 'Option number 3',
    'Option 4': 'Option number 4',
    'Option A': 'Option A',
    'Option B': 'Option B',
    'Option C': 'Option C',
    'Option D': 'Option D',
    
    // Code-related terms
    'const': 'constant',
    'let': 'let',
    'var': 'variable',
    'function': 'function',
    'return': 'return',
    'if': 'if',
    'else': 'else',
    'for': 'for',
    'while': 'while',
    'class': 'class',
    'import': 'import',
    'export': 'export',
    
    // Mathematical symbols - handled selectively to avoid breaking programming terms
    '+': 'plus',
    // Removed standalone '-': 'minus' to preserve terms like "if-else"
    '*': 'times',
    '/': 'divided by',
    '%': 'modulo',
    '<': 'less than',
    '>': 'greater than',
    '!': 'not',
    '=': 'equals',
    
    // File extensions
    '.js': 'dot javascript',
    '.html': 'dot H T M L',
    '.css': 'dot C S S',
    '.json': 'dot jason',
    '.xml': 'dot X M L',
    '.txt': 'dot text',
    '.pdf': 'dot P D F',
    
    // Common technical words that might be mispronounced
    'cache': 'cash',
    'facade': 'fa-sahd',
    'queue': 'cue',
    'tuple': 'two-pull',
    'enum': 'ee-num',
    'async': 'a-sync',
    'await': 'a-wait',
    'regex': 'regular expression',
    'sudo': 'sue-do',
    'chmod': 'change mode',
    'char': 'care', // Programming pronunciation: like "character"
    'int': 'integer', // Make it clear it's "integer" not "int" like "hint"  
    'bool': 'boolean', // Full word instead of abbreviation
    'struct': 'structure', // Full pronunciation
    'malloc': 'mal-lock', // Memory allocation
    'printf': 'print-f', // Print function
    'scanf': 'scan-f', // Scan function
    'iostream': 'I O stream', // Input/output stream
    'endl': 'end line', // End line, not "end-ell"
    'nullptr': 'null pointer', // Null pointer
    'sizeof': 'size of', // Size of operator
    'typedef': 'type def', // Type definition
    'const': 'constant', // Already there but emphasizing
    'static': 'static', // Ensure clear pronunciation
    'extern': 'external', // External linkage
    'inline': 'in-line', // Inline function
    'virtual': 'virtual', // Virtual function
    'override': 'over-ride', // Override keyword
    'namespace': 'name space', // Namespace
    'template': 'template', // Template
    'typename': 'type name', // Type name
    'decltype': 'declare type', // Declare type
    'auto': 'auto', // Auto keyword
    'lambda': 'lambda', // Lambda function
    'std': 'standard', // Standard library
    'cout': 'see-out', // Console output
    'cin': 'see-in', // Console input
    'cerr': 'see-error', // Console error
    
    // Database terms
    'MySQL': 'My S Q L',
    'PostgreSQL': 'Postgres S Q L',
    'MongoDB': 'Mongo D B',
    'NoSQL': 'No S Q L',
  };
  
  // Apply replacements (case insensitive)
  // Handle symbols first (exact string replacement)
  const symbolReplacements = {
    '===': 'strict equals',
    '!==': 'strict not equals', 
    '==': 'equals equals',
    '!=': 'not equals',
    '<=': 'less than or equal to',
    '>=': 'greater than or equal to',
    '&&': 'and',
    '||': 'or',
    '++': 'plus plus',
    '--': 'minus minus',
    '+=': 'plus equals',
    '-=': 'minus equals',
    '*=': 'times equals',
    '/=': 'divided equals',
    '%=': 'modulo equals',
    '=>': 'arrow function',
    '->': 'arrow',
    '::': 'double colon'
  };
  
  // Apply symbol replacements first (exact match)
  Object.entries(symbolReplacements).forEach(([key, value]) => {
    processedText = processedText.split(key).join(value);
  });
  
  // Apply word replacements (word boundary)
  Object.entries(replacements).forEach(([key, value]) => {
    // Skip symbols (already handled above)
    if (symbolReplacements[key]) return;
    
    // Escape special regex characters for word boundaries
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
    processedText = processedText.replace(regex, value);
  });
  
  // Add pauses after punctuation for better flow
  processedText = processedText.replace(/\./g, '. ');
  processedText = processedText.replace(/,/g, ', ');
  processedText = processedText.replace(/:/g, ': ');
  processedText = processedText.replace(/;/g, '; ');
  
  // Handle mathematical minus vs hyphenated words more selectively
  // Replace minus only in mathematical contexts (surrounded by numbers or spaces)
  processedText = processedText.replace(/(\s|^)(-)\s*(\d)/g, '$1minus $3');  // " - 5" -> " minus 5"
  processedText = processedText.replace(/(\d)\s*(-)\s*(\d)/g, '$1 minus $3'); // "5 - 3" -> "5 minus 3"
  
  // Keep hyphens in programming terms and compound words intact
  // Common programming patterns like "if-else", "switch-case", "for-each" are preserved
  
  // Clean up multiple spaces
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};

// Global variable to store the selected voice for consistency
let selectedVoice = null;

/**
 * Gets and caches the preferred voice for consistent speech
 * @returns {SpeechSynthesisVoice|null} - The selected voice
 */
const getConsistentVoice = () => {
  if (selectedVoice) {
    return selectedVoice;
  }
  
  const voices = speechSynthesis.getVoices();
  
  // Prefer female voices as they're often clearer for technical content
  selectedVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Hazel'))
  ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  
  console.log('Selected consistent voice:', selectedVoice?.name);
  return selectedVoice;
};

/**
 * Creates a speech synthesis utterance with optimal settings
 * @param {string} text - Text to speak
 * @param {object} options - Speech configuration options
 * @returns {SpeechSynthesisUtterance} - Configured speech utterance
 */
export const createSpeechUtterance = (text, options = {}) => {
  const {
    rate = 0.8,          // Slower for better comprehension
    pitch = 1,           // Normal pitch
    volume = 1,          // Full volume
    lang = 'en-US',      // US English for better pronunciation of technical terms
    voice = null         // Specific voice (will auto-select if null)
  } = options;
  
  // Preprocess text for better pronunciation
  const processedText = preprocessTextForSpeech(text);
  
  const utterance = new SpeechSynthesisUtterance(processedText);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  utterance.lang = lang;
  
  // Use consistent voice selection
  if (voice) {
    utterance.voice = voice;
  } else {
    utterance.voice = getConsistentVoice();
  }
  
  return utterance;
};

/**
 * Speaks text with improved pronunciation and error handling
 * @param {string} text - Text to speak
 * @param {object} options - Speech options
 * @returns {Promise} - Resolves when speech completes
 */
export const speakText = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!text || !window.speechSynthesis) {
      reject(new Error('Text-to-speech not available'));
      return;
    }
    
    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    const utterance = createSpeechUtterance(text, options);
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));
    
    // Add a small delay to ensure cancellation took effect
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  });
};

/**
 * Gets available voices sorted by quality/preference
 * @returns {Array} - Array of available voices
 */
export const getAvailableVoices = () => {
  const voices = speechSynthesis.getVoices();
  
  // Sort voices by preference (English voices first, then by quality indicators)
  return voices.sort((a, b) => {
    // Prefer English voices
    if (a.lang.startsWith('en') && !b.lang.startsWith('en')) return -1;
    if (!a.lang.startsWith('en') && b.lang.startsWith('en')) return 1;
    
    // Prefer local voices (usually better quality)
    if (a.localService && !b.localService) return -1;
    if (!a.localService && b.localService) return 1;
    
    // Prefer specific high-quality voice names
    const highQualityNames = ['Zira', 'Hazel', 'Karen', 'Moira', 'Tessa'];
    const aIsHighQuality = highQualityNames.some(name => a.name.includes(name));
    const bIsHighQuality = highQualityNames.some(name => b.name.includes(name));
    
    if (aIsHighQuality && !bIsHighQuality) return -1;
    if (!aIsHighQuality && bIsHighQuality) return 1;
    
    return a.name.localeCompare(b.name);
  });
};

// Initialize voices when they become available
let voicesInitialized = false;
const initializeVoices = () => {
  if (!voicesInitialized && speechSynthesis.getVoices().length > 0) {
    voicesInitialized = true;
    
    // Initialize the consistent voice selection early
    getConsistentVoice();
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Available voices:', getAvailableVoices().map(v => v.name));
    }
  }
};

// Some browsers load voices asynchronously
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = initializeVoices;
}

// Also try to initialize immediately
initializeVoices();

/**
 * Normalizes speech recognition input for better programming term matching
 * @param {string} spokenText - Text received from speech recognition
 * @returns {string} - Normalized text for better matching
 */
export const normalizeSpeechInput = (spokenText) => {
  if (!spokenText || typeof spokenText !== 'string') return '';
  
  let normalized = spokenText.toLowerCase().trim();
  
  // Programming term normalizations for speech recognition
  const speechRecognitionMappings = {
    // Handle different ways users might say programming terms
    'care': 'char', // Map back from pronunciation to actual term
    'character': 'char',
    'see out': 'cout',
    'see in': 'cin', 
    'see error': 'cerr',
    'see plus plus': 'c++',
    'c plus plus': 'c++',
    'see sharp': 'c#',
    'c sharp': 'c#',
    'integer': 'int',
    'boolean': 'bool',
    'structure': 'struct',
    'mal lock': 'malloc',
    'memory allocation': 'malloc',
    'print f': 'printf',
    'scan f': 'scanf',
    'i o stream': 'iostream',
    'input output stream': 'iostream',
    'end line': 'endl',
    'null pointer': 'nullptr',
    'size of': 'sizeof',
    'type def': 'typedef',
    'type definition': 'typedef',
    'constant': 'const',
    'external': 'extern',
    'in line': 'inline',
    'over ride': 'override',
    'name space': 'namespace',
    'type name': 'typename',
    'declare type': 'decltype',
    'standard': 'std',
    'standard library': 'std',
    'lambda function': 'lambda',
    'regular expression': 'regex',
    'a sync': 'async',
    'a wait': 'await',
    'sue do': 'sudo',
    'change mode': 'chmod',
    'cash': 'cache', // Map pronunciation back to term
    'cue': 'queue',
    'two pull': 'tuple',
    'ee num': 'enum',
    
    // Common variations in speech recognition
    'option number one': 'option 1',
    'option number two': 'option 2', 
    'option number three': 'option 3',
    'option number four': 'option 4',
    'choice number one': 'choice 1',
    'choice number two': 'choice 2',
    'choice number three': 'choice 3', 
    'choice number four': 'choice 4',
    'the first one': 'first',
    'the second one': 'second',
    'the third one': 'third',
    'the fourth one': 'fourth',
    
    // Handle common speech recognition errors
    'include studio': '#include <stdio>',
    'include iostream': '#include <iostream>',
    'using namespace standard': 'using namespace std',
    'main function': 'int main()',
    'return zero': 'return 0',
  };
  
  // Apply normalizations
  Object.entries(speechRecognitionMappings).forEach(([spoken, actual]) => {
    const regex = new RegExp(`\\b${spoken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    normalized = normalized.replace(regex, actual);
  });
  
  // Clean up multiple spaces and return
  return normalized.replace(/\s+/g, ' ').trim();
};