"""
Question PDF processing service
"""
import re
import traceback
from .pdf_utils import extract_tables_from_pdf, extract_text_from_pdf

def extract_questions_from_pdf(pdf_file_stream):
    """
    Extracts question information from a PDF file stream.
    Expects question data in formats like:
    - Q1. What is the output of the following code?
    - Question 1: Which of the following is correct?
    - Or tabular format with questions and options
    """
    questions = []
    
    try:
        # Method 1: Try to extract tables first (for structured question PDFs)
        tables = extract_tables_from_pdf(pdf_file_stream)
        
        if tables:
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
            text_questions = extract_questions_from_text(text)
            questions.extend(text_questions)
                
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
    return unique_questions

def is_question_text(text):
    """
    Determines if a text string looks like a question.
    """
    text = text.strip().lower()
    
    # Question indicators
    question_patterns = [
        r'^q\d+\.?\s+',  # Q1. or Q1 
        r'^question\s*\d+',  # Question 1
        r'^\d+\.?\s+',  # 1. or 1
        r'\?',  # Contains question mark
        r'^(what|which|who|when|where|why|how)\s+',  # Question words
        r'following.*correct',  # Common MCQ phrase
        r'output.*code',  # Programming questions
    ]
    
    for pattern in question_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False

def extract_questions_from_text(text):
    """
    Extract questions from plain text.
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
                questions.append(current_question)
            
            # Start new question
            current_question = {
                "question": line,
                "options": [],
                "correctAnswer": "",
                "type": "multiple-choice"
            }
        elif current_question:
            # This might be an option or part of the question
            # For now, treat additional lines as part of the question
            if len(line) > 10:  # Avoid adding short fragments
                current_question["question"] += " " + line
    
    # Add the last question
    if current_question:
        questions.append(current_question)
    
    return questions