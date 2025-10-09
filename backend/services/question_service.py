"""
Question PDF processing service with enhanced text extraction and code formatting
"""
import re
import logging
from .pdf_utils import extract_text_from_pdf, clean_pdf_text

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_questions_from_pdf(file):
    """
    Enhanced question extraction with better code block handling and question boundary detection
    Returns list of question dictionaries directly (new API format)
    """
    try:
        text_content = extract_text_from_pdf(file)
        
        if not text_content:
            logger.error("No text content extracted from PDF")
            return []
        
        logger.info(f"Raw text length: {len(text_content)} characters")
        
        # Clean the text with comprehensive character mapping
        cleaned_text = clean_pdf_text(text_content)
        logger.info(f"Cleaned text length: {len(cleaned_text)} characters")
        
        # Debug: Log a sample of the text to see structure
        logger.info(f"Text sample (first 1000 chars): {cleaned_text[:1000]}")
        logger.info(f"Text sample (last 1000 chars): {cleaned_text[-1000:]}")
        
        # Split into potential questions using improved patterns
        questions = []
        
        # Enhanced question detection patterns with priority order
        question_patterns = [
            # Pattern 1: Numbered questions with options and answers (highest priority for your format)
            r'(?:^|\n)\s*(\d+)\.\s*(.+?)(?=(?:^|\n)\s*\d+\.|$)',
            
            # Pattern 2: Explicit question numbering 
            r'(?:^|\n)\s*(?:Q\.?|Question|Problem)\s*\d+[\.\):]\s*(.+?)(?=(?:^|\n)\s*(?:Q\.?|Question|Problem)\s*\d+[\.\):]|(?:^|\n)\s*(?:A\.?|Answer|Solution)\s*\d+|$)',
            
            # Pattern 3: Simple numbering with flexible spacing (fallback)
            r'(?:^|\n)\s*(\d+)[\.\)]\s*(.+?)(?=(?:^|\n)\s*\d+[\.\)]|$)',
            
            # Pattern 4: Question-like sentences (lower priority)
            r'(?:^|\n)\s*([A-Z][\w\s]{10,}(?:below|following|code|program|output|result)[\w\s]*\?)(?=(?:^|\n)|$)',
        ]
        
        # Try each pattern with priority
        for i, pattern in enumerate(question_patterns):
            matches = re.findall(pattern, cleaned_text, re.DOTALL | re.IGNORECASE)
            if matches:
                logger.info(f"Pattern {i+1} found {len(matches)} questions")
                
                for match in matches:
                    # Handle different match formats (tuple vs string)
                    if isinstance(match, tuple):
                        if len(match) >= 2 and match[0].isdigit():
                            # Format: (number, question) from Pattern 2
                            question_text = match[1].strip()
                        else:
                            # Take the longest non-empty element
                            question_text = max((m for m in match if m.strip()), key=len, default='').strip()
                    else:
                        question_text = match.strip()
                    
                    # Skip if too short or likely not a question
                    if len(question_text) < 10:
                        continue
                    
                    # Enhanced question validation
                    if is_question_text(question_text):
                        # Better code block extraction and preservation
                        formatted_question = format_question_with_code(question_text)
                        
                        # Extract options and clean question text
                        options = extract_options_from_text(formatted_question)
                        correct_answer_letter = extract_correct_answer_from_text(formatted_question)
                        clean_question_text = separate_question_from_options(formatted_question, options)
                        
                        # Map the answer letter to the actual option text
                        correct_answer_text = ""
                        if correct_answer_letter and len(options) >= 4:
                            # Map A->0, B->1, C->2, D->3
                            answer_index_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
                            if correct_answer_letter.upper() in answer_index_map:
                                index = answer_index_map[correct_answer_letter.upper()]
                                if index < len(options):
                                    correct_answer_text = options[index]
                        
                        # Create question object in expected format
                        question_obj = {
                            "question": clean_question_text,
                            "options": options,
                            "correctAnswer": correct_answer_text
                        }
                        questions.append(question_obj)
                        logger.info(f"Added question with {len(options)} options, correct answer: {correct_answer_letter} -> '{correct_answer_text[:30]}...': {clean_question_text[:100]}...")
                
                if questions:
                    break  # Use first pattern that finds valid questions
        
        # Fallback: Split by double newlines and look for question-like content
        if not questions:
            logger.info("No pattern matches, trying paragraph-based extraction")
            paragraphs = [p.strip() for p in cleaned_text.split('\n\n') if p.strip()]
            
            for para in paragraphs:
                if len(para) > 20 and is_question_text(para):
                    formatted_question = format_question_with_code(para)
                    
                    # Extract options and clean question text
                    options = extract_options_from_text(formatted_question)
                    correct_answer_letter = extract_correct_answer_from_text(formatted_question)
                    clean_question_text = separate_question_from_options(formatted_question, options)
                    
                    # Map the answer letter to the actual option text
                    correct_answer_text = ""
                    if correct_answer_letter and len(options) >= 4:
                        # Map A->0, B->1, C->2, D->3
                        answer_index_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
                        if correct_answer_letter.upper() in answer_index_map:
                            index = answer_index_map[correct_answer_letter.upper()]
                            if index < len(options):
                                correct_answer_text = options[index]
                    
                    question_obj = {
                        "question": clean_question_text,
                        "options": options,
                        "correctAnswer": correct_answer_text
                    }
                    questions.append(question_obj)
                    logger.info(f"Added paragraph question with {len(options)} options, correct answer: {correct_answer_letter} -> '{correct_answer_text[:30]}...': {clean_question_text[:100]}...")
        
        # Validate and clean up questions
        validated_questions = validate_extracted_questions(questions)
        
        logger.info(f"Successfully extracted {len(validated_questions)} questions")
        return validated_questions
        
    except Exception as e:
        logger.error(f"Error in question extraction: {str(e)}")
        return []

def format_question_with_code(question_text):
    """Format question text preserving code blocks with proper structure - Multi-language support"""
    import re
    
    # Identify and preserve code blocks
    lines = question_text.split('\n')
    formatted_lines = []
    in_code_block = False
    code_block_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Multi-language code block detection patterns
        code_start_patterns = [
            # Java patterns
            r'public\s+class', r'public\s+static', r'System\.out\.',
            
            # C/C++ patterns
            r'#include\s*<', r'int\s+main\s*\(', r'using\s+namespace',
            r'cout\s*<<', r'cin\s*>>', r'printf\s*\(', r'scanf\s*\(',
            r'malloc\s*\(', r'free\s*\(', r'sizeof\s*\(',
            
            # Python patterns
            r'def\s+\w+\s*\(', r'if\s+__name__', r'print\s*\(',
            r'import\s+\w+', r'from\s+\w+\s+import',
            
            # JavaScript patterns
            r'function\s+\w+', r'console\.log', r'let\s+\w+\s*=',
            r'const\s+\w+\s*=', r'var\s+\w+\s*=',
            
            # General programming patterns
            r'for\s*\(', r'while\s*\(', r'if\s*\(', r'do\s*{',
            r'return\s+', r'break\s*;', r'continue\s*;',
        ]
        
        # Detect code block start
        is_code_start = (
            any(re.search(pattern, stripped, re.IGNORECASE) for pattern in code_start_patterns) or
            stripped.endswith('{') or
            stripped.endswith(';') or
            re.match(r'^\s*[a-zA-Z_]\w*\s+[a-zA-Z_]\w*\s*[=;(]', stripped) or  # Variable declarations
            re.match(r'^\s*[a-zA-Z_]\w*\s*\(.*\)', stripped)  # Function calls
        )
        
        if is_code_start:
            if not in_code_block:
                in_code_block = True
                if formatted_lines and formatted_lines[-1].strip():  # Add newline before code block
                    formatted_lines.append('')
            code_block_lines.append(line)
        
        # Detect code block end
        elif in_code_block and (stripped == '}' or (stripped.endswith('}') and len(stripped) < 10)):
            code_block_lines.append(line)
            # Process the complete code block
            if code_block_lines:
                formatted_lines.extend(code_block_lines)
                formatted_lines.append('')  # Add newline after code block
            code_block_lines = []
            in_code_block = False
        
        # Inside code block
        elif in_code_block:
            code_block_lines.append(line)
        
        # Regular text
        else:
            # If we have accumulated code block lines, add them first
            if code_block_lines:
                formatted_lines.extend(code_block_lines)
                formatted_lines.append('')
                code_block_lines = []
                in_code_block = False
            
            if stripped:  # Only add non-empty lines
                formatted_lines.append(stripped)
    
    # Handle any remaining code block lines
    if code_block_lines:
        if formatted_lines and formatted_lines[-1].strip():
            formatted_lines.append('')
        formatted_lines.extend(code_block_lines)
    
    # Join and clean up
    formatted_text = '\n'.join(formatted_lines)
    
    # Fix common formatting issues but preserve code structure
    formatted_text = re.sub(r'\n{3,}', '\n\n', formatted_text)  # Limit newlines
    
    return formatted_text.strip()

def is_question_text(text):
    """
    Enhanced question detection with multi-language programming support
    """
    if not text or len(text.strip()) < 5:  # Reduced minimum length
        return False
    
    text_clean = text.strip().lower()
    
    # Priority patterns - these are strong indicators
    priority_patterns = [
        r'^q\d+\.?\s+',  # Q1. or Q1 
        r'^question\s*\d+',  # Question 1
        r'^\d+\.?\s+',  # 1. or 1 (numbered questions) - This should catch all numbered questions
        r'^what\s+will\s+be\s+the\s+output',  # Programming questions
        r'^what\s+is\s+the\s+output',  # Programming questions
    ]
    
    # Check priority patterns first
    for pattern in priority_patterns:
        if re.search(pattern, text_clean, re.IGNORECASE):
            return True
    
    # Additional patterns - but only for longer text (avoid fragments)
    if len(text_clean) > 10:  # Reduced threshold further
        additional_patterns = [
            r'^(what|which|who|when|where|why|how)\s+',  # Question words
            r'following.*correct',  # Common MCQ phrase
            r'output.*code',  # Programming questions
            r'code.*output',  # Programming questions
            r'^.{10,}.*\?$',  # Ends with ? but is substantial text (10+ chars before ?)
            
            # Language-specific patterns
            r'final\s+keyword',  # Java: "The final keyword"
            r'interface.*can\s+contain',  # Java: Interface questions
            r'super\s+keyword',  # Java: Super keyword questions
            r'if\s+int\s+x\s*=',  # Java/C++: Ternary operator question
            r'value\s+of\s+x\s*[><=]',  # Ternary operator continuation
            r'method\s+overloading',  # Java/C++: Method overloading
            
            # C/C++ specific patterns
            r'pointer.*variable',  # C/C++: Pointer questions
            r'malloc.*function',  # C: Memory allocation
            r'include.*header',  # C/C++: Header file questions
            r'namespace.*std',  # C++: Namespace questions
            r'cout.*endl',  # C++: Output questions
            r'break.*statement',  # C/C++: Break statement questions
            r'do-while.*loop',  # C/C++: Do-while loop questions
            r'storage.*class',  # C: Storage class specifiers
            r'header.*file.*required',  # C: Header file questions
            r'operator.*used.*access',  # C: -> operator questions
            r'calloc.*used',  # C: Memory allocation functions
            
            # Python specific patterns
            r'python.*list',  # Python: List questions
            r'def.*function',  # Python: Function definition
            r'import.*module',  # Python: Import questions
            r'indentation.*python',  # Python: Indentation questions
            r'__init__.*method',  # Python: Constructor questions
            
            # JavaScript specific patterns
            r'var.*let.*const',  # JavaScript: Variable declaration
            r'function.*arrow',  # JavaScript: Function questions
            r'console\.log',  # JavaScript: Output questions
            r'event.*handler',  # JavaScript: Event handling
            r'callback.*function',  # JavaScript: Callback questions
            
            # General programming concepts
            r'data.*type',  # Data type questions
            r'loop.*iteration',  # Loop questions
            r'array.*element',  # Array questions
            r'variable.*scope',  # Scope questions
            r'memory.*allocation',  # Memory questions
            r'compile.*error',  # Compilation questions
            r'runtime.*error',  # Runtime error questions
            r'syntax.*error',  # Syntax error questions
            
            # Statement-based questions (common in academic tests)
            r'.*is\s+responsible\s+for.*:',  # "X is responsible for:"
            r'.*purpose\s+of.*:',  # "The purpose of X:"
            r'.*function\s+of.*:',  # "The function of X:"
            r'.*role\s+of.*:',  # "The role of X:"
            r'.*main\s+.*\s+of.*:',  # "The main function of X:"
            r'java\s+virtual\s+machine',  # JVM questions
            r'jvm.*responsible',  # JVM responsibility questions
            r'.*following.*true',  # "Which of the following is true"
            r'.*access\s+modif',  # Access modifier questions
            r'.*keyword.*java',  # Java keyword questions
            r'.*exception.*thrown',  # Exception handling questions
            r'.*block.*executed',  # Code block questions
        ]
        
        for pattern in additional_patterns:
            if re.search(pattern, text_clean, re.IGNORECASE):
                return True
    
    # Special case for very specific question fragments that might be valid
    special_cases = [
        r'x\s*>\s*10.*\?\s*20.*:\s*30',  # Ternary operator pattern
        r'having\s+two\s+or\s+more\s+methods',  # Method overloading definition
        r'true\s+or\s+false',  # Boolean questions
        r'compile.*time.*runtime',  # Compile vs runtime questions
        r'stack.*heap.*memory',  # Memory management
        r'break.*statement.*used.*exit',  # C: Break statement question
        r'do-while.*loop.*guaranteed.*execute',  # C: Do-while loop question
        r'if.*int.*a.*=.*5.*b.*=.*2',  # C: Type casting question
        r'operator.*used.*access.*members',  # C: -> operator question
    ]
    
    for pattern in special_cases:
        if re.search(pattern, text_clean, re.IGNORECASE):
            return True
    
    return False

def extract_options_from_text(question_text):
    """Extract answer options from question text if present"""
    options = []
    
    # Multiple patterns to catch different option formats
    option_patterns = [
        # Pattern 1: Uppercase letters with dots - A. B. C. D. (most common in academic PDFs)
        # Look for each option separately on its own line or with clear separation
        r'(?:^|\n)\s*([A-D])\.\s*([^\n\r]+?)(?=\s*(?:^|\n)\s*[A-D]\.|Answer:|$)',
        
        # Pattern 2: Find all A. B. C. D. options in sequence
        r'([A-D])\.\s*([^A-D\n]+?)(?=\s*[A-D]\.|Answer:|$)',
        
        # Pattern 3: Lowercase letters with parentheses - a) b) c) d)
        r'([a-d])\)\s*([^\n\r]+?)(?=\s*[a-d]\)|Answer:|$)',
        
        # Pattern 4: Uppercase letters with parentheses - A) B) C) D)
        r'([A-D])\)\s*([^A-D\n]+?)(?=\s*[A-D]\)|Answer:|$)',
    ]
    
    # Try each pattern
    for i, pattern in enumerate(option_patterns):
        matches = re.findall(pattern, question_text, re.IGNORECASE | re.MULTILINE | re.DOTALL)
        
        if matches and len(matches) >= 2:
            # Clean up matches and filter out empty ones
            clean_options = []
            for match in matches:
                if len(match) == 2:  # (letter, text) tuple
                    letter, text = match
                    cleaned = text.strip()
                else:
                    cleaned = match.strip() if isinstance(match, str) else str(match).strip()
                
                # Remove newlines within the option and normalize whitespace
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                
                # Remove trailing punctuation and clean up
                cleaned = re.sub(r'[,\s]*$', '', cleaned)
                
                # Must have actual content
                if cleaned and len(cleaned) > 2:
                    clean_options.append(cleaned)
            
            # Only accept if we have at least 2 valid options (preferably 4 for MCQ)
            if len(clean_options) >= 2:
                options = clean_options[:4]  # Limit to 4 options max
                logger.info(f"Pattern {i+1} extracted {len(options)} options: {[opt[:30] + '...' if len(opt) > 30 else opt for opt in options]}")
                break
    
    return options

def extract_correct_answer_from_text(question_text):
    """Extract the correct answer from question text if present"""
    
    # Patterns to find "Answer: X" where X is the correct option
    answer_patterns = [
        r'Answer:\s*([A-D])\.\s*[^A-D]*',  # Answer: A. some text
        r'Answer:\s*([A-D])\s*[^A-D]*',    # Answer: A some text  
        r'Answer:\s*([A-D])\)',           # Answer: A)
        r'Answer:\s*([A-D])',             # Answer: A
    ]
    
    for pattern in answer_patterns:
        match = re.search(pattern, question_text, re.IGNORECASE)
        if match:
            correct_letter = match.group(1).upper()
            logger.info(f"Found correct answer: {correct_letter}")
            return correct_letter
    
    return ""

def separate_question_from_options(question_text, options):
    """
    Remove extracted options and answer from the question text to get clean question
    """
    clean_question = question_text
    
    # Remove the answer section first (everything from "Answer:" to end)
    answer_patterns = [
        r'Answer:\s*[A-D]\..*$',     # Answer: A. explanation
        r'Answer:\s*[A-D]\s*.*$',   # Answer: A explanation
        r'Answer:\s*[A-D]$',        # Answer: A (at end)
    ]
    
    for pattern in answer_patterns:
        clean_question = re.sub(pattern, '', clean_question, flags=re.IGNORECASE | re.MULTILINE | re.DOTALL)
    
    # Remove all option lines - handle both A. and A) formats
    # More aggressive approach: remove complete lines that start with option letters
    option_line_patterns = [
        r'(?:^|\n)\s*[A-D]\.\s*[^\n\r]*',   # Lines starting with A. B. C. D.
        r'(?:^|\n)\s*[A-D]\)\s*[^\n\r]*',   # Lines starting with A) B) C) D)
        r'(?:^|\n)\s*[a-d]\)\s*[^\n\r]*',   # Lines starting with a) b) c) d)
    ]
    
    for pattern in option_line_patterns:
        clean_question = re.sub(pattern, '', clean_question, flags=re.MULTILINE | re.IGNORECASE)
    
    # Also remove each individual option text if it still exists (fallback)
    for option in options:
        if option and len(option) > 3:  # Only remove substantial text to avoid removing single words
            # Create pattern to match the option (escape special regex chars)
            option_pattern = re.escape(option)
            clean_question = re.sub(option_pattern, '', clean_question, flags=re.IGNORECASE)
    
    # Clean up extra whitespace and newlines
    clean_question = re.sub(r'\n{3,}', '\n\n', clean_question)  # Limit consecutive newlines
    clean_question = re.sub(r'[ \t]+\n', '\n', clean_question)  # Remove trailing spaces
    clean_question = re.sub(r'\n[ \t]+', '\n', clean_question)  # Remove leading spaces
    clean_question = re.sub(r'^\s+|\s+$', '', clean_question, flags=re.MULTILINE)  # Trim lines
    
    # Remove empty lines
    lines = [line.strip() for line in clean_question.split('\n') if line.strip()]
    clean_question = '\n'.join(lines)
    
    # Fix specific issues like truncated words
    clean_question = re.sub(r'AN\d+', 'AND)', clean_question)  # Fix "AN4" -> "AND)"
    clean_question = re.sub(r'OR\d+', 'OR)', clean_question)   # Fix "OR4" -> "OR)"
    
    return clean_question.strip()

def validate_extracted_questions(questions):
    """
    Validate and clean up extracted questions
    """
    if not questions:
        return []
    
    validated = []
    
    for i, q in enumerate(questions, 1):
        question_text = q.get("question", "").strip()
        
        # Skip invalid questions
        if not question_text or len(question_text) < 10:
            logger.warning(f"Skipping question {i}: Too short")
            continue
        
        # Clean up the question structure
        clean_question = {
            "question": question_text,
            "options": q.get("options", []),
            "correctAnswer": q.get("correctAnswer", "")
        }
        
        validated.append(clean_question)
    
    logger.info(f"Validated {len(validated)} out of {len(questions)} questions")
    return validated
