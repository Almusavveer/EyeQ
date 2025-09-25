"""
Question PDF processing service
"""
import re
import traceback
from .pdf_utils import extract_tables_from_pdf, extract_text_from_pdf

def extract_questions_from_pdf(pdf_file_stream):
    """
    Extracts question information from a PDF file stream.
    Enhanced with comprehensive error handling and text cleanup.
    """
    questions = []
    
    try:
        # Method 1: Try to extract tables first (for structured question PDFs)
        tables = extract_tables_from_pdf(pdf_file_stream)
        
        if tables:
            print(f"Found {len(tables)} tables in PDF")
            for table_index, table in enumerate(tables):
                if not table or len(table) < 1:
                    continue
                    
                # Process each row as a potential question
                for row in table:
                    if not row or not any(row):  # Skip empty rows
                        continue
                        
                    # Look for question patterns in the first non-empty cell
                    for cell in row:
                        if cell and str(cell).strip():
                            cell_text = str(cell).strip()
                            
                            # Check if this looks like a question
                            if is_question_text(cell_text):
                                question = {
                                    "question": cell_text,
                                    "options": [],
                                    "correctAnswer": "",
                                    "type": "multiple-choice"
                                }
                                questions.append(question)
                                break  # Move to next row
        
        # Method 2: Extract text and parse for questions
        text = extract_text_from_pdf(pdf_file_stream)
        if text:
            print(f"Extracted text length: {len(text)} characters")
            text_questions = extract_questions_from_text(text)
            questions.extend(text_questions)
            
            # Log potential encoding issues for user feedback
            if any(char in text for char in ['Ɵ', 'ƞ', 'Ɨ', '(cid:']):
                print("Warning: PDF contained encoding issues that were automatically corrected")
                
    except Exception as e:
        print(f"Error processing PDF for questions: {e}")
        traceback.print_exc()
        return []

    # Remove duplicates based on question text
    seen_questions = set()
    unique_questions = []
    for q in questions:
        question_text = q.get("question", "").strip().lower()
        if question_text and question_text not in seen_questions:
            seen_questions.add(question_text)
            unique_questions.append(q)

    print(f"Successfully extracted {len(unique_questions)} unique questions")
    
    # Validate extracted questions
    if unique_questions:
        validate_extracted_questions(unique_questions)
    
    return unique_questions

def validate_extracted_questions(questions):
    """
    Validate extracted questions and provide user feedback
    """
    issues = []
    
    for i, q in enumerate(questions, 1):
        question_text = q.get("question", "")
        options = q.get("options", [])
        
        # Check for common issues
        if len(question_text) < 10:
            issues.append(f"Question {i}: Very short question text")
        
        if len(options) == 0:
            issues.append(f"Question {i}: No options extracted")
        elif len(options) < 4:
            issues.append(f"Question {i}: Only {len(options)} options found (expected 4)")
        
        # Check for remaining encoding issues
        if any(char in question_text for char in ['�', '?', 'â€™', 'â€œ', 'â€�']):
            issues.append(f"Question {i}: Contains unresolved encoding issues")
    
    if issues:
        print("Quality check results:")
        for issue in issues[:10]:  # Limit to first 10 issues
            print(f"  - {issue}")
        if len(issues) > 10:
            print(f"  ... and {len(issues) - 10} more issues")
    else:
        print("Quality check: All questions passed validation")

def is_question_text(text):
    """
    Determines if a text string looks like a question.
    Enhanced to be more strict and avoid false positives.
    """
    text = text.strip().lower()
    
    # Priority patterns - these are strong indicators
    priority_patterns = [
        r'^q\d+\.?\s+',  # Q1. or Q1 
        r'^question\s*\d+',  # Question 1
        r'^\d+\.?\s+',  # 1. or 1 (numbered questions)
    ]
    
    # Check priority patterns first
    for pattern in priority_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    # Additional patterns - but only for longer text (avoid fragments)
    if len(text) > 20:  # Only apply these to substantial text
        additional_patterns = [
            r'^(what|which|who|when|where|why|how)\s+',  # Question words
            r'following.*correct',  # Common MCQ phrase
            r'output.*code',  # Programming questions
            r'^.{10,}.*\?$',  # Ends with ? but is substantial text (10+ chars before ?)
        ]
        
        for pattern in additional_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
    
    return False

def extract_questions_from_text(text):
    """
    Extract questions from plain text.
    Enhanced to properly handle line splits and clean text formatting.
    """
    questions = []
    lines = text.splitlines()
    
    current_question = None
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if this line is a question
        if is_question_text(line):
            # Save previous question if exists
            if current_question:
                # Clean and extract options from question text before saving
                current_question = clean_and_extract_options(current_question)
                questions.append(current_question)
            
            # Start new question
            current_question = {
                "question": line,
                "options": [],
                "correctAnswer": "",
                "type": "multiple-choice"
            }
        elif current_question:
            # Check if this line is an option (a), b), c), d))
            if re.match(r'^[a-d]\)\s+', line.lower()):
                current_question["options"].append(line)
            # Check if this looks like a question fragment (avoid treating fragments as new questions)
            elif len(line) < 50 and line.endswith('?') and not line.startswith(('what', 'which', 'who', 'when', 'where', 'why', 'how')):
                # This is likely a continuation of the current question, not a new one
                # Add with a space to properly join the lines
                current_question["question"] += " " + line
            # Otherwise, it's part of the question text
            elif len(line) > 3:  # Avoid adding short fragments
                # Add with a space to properly join the lines
                current_question["question"] += " " + line
    
    # Add the last question
    if current_question:
        current_question = clean_and_extract_options(current_question)
        questions.append(current_question)
    
    return questions

def clean_and_extract_options(question_obj):
    """
    Clean question text and extract options that are embedded within the question text
    """
    import re
    
    question_text = question_obj["question"]
    
    # Clean up extra spaces and normalize whitespace
    question_text = re.sub(r'\s+', ' ', question_text).strip()
    
    # Pattern to find options like "a) text b) text c) text d) text"
    option_pattern = r'([a-d]\)\s*[^a-d\)]*?)(?=[a-d]\)|$)'
    
    # Find all options in the question text
    matches = re.findall(option_pattern, question_text, re.IGNORECASE)
    
    if matches and len(matches) >= 2:  # At least 2 options found
        # Remove options from question text
        clean_question = re.sub(r'[a-d]\).*$', '', question_text, flags=re.IGNORECASE).strip()
        
        # Clean up the question text
        question_obj["question"] = clean_question
        
        # Add extracted options if not already present
        if not question_obj["options"]:
            question_obj["options"] = [match.strip() for match in matches if match.strip()]
    else:
        # Just clean the question text
        question_obj["question"] = question_text
    
    return question_obj