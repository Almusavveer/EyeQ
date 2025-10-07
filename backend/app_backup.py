from flask import Flask, request, jsonify
import pdfplumber
from flask_cors import CORS
import io
import sys
import traceback

# Initialize Flask app
app = Flask(__name__)

# Configure CORS with specific settings for production
CORS(app, origins=[
    "https://eye-q-black.vercel.app", 
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174"
])

def extract_students_from_pdf(pdf_file_stream):
    """
    Extracts student information from a PDF file stream.
    Enhanced to handle tabular format PDFs (Excel converted to PDF).
    Supports both table extraction and text-based patterns.
    """
    students = []
    
    try:
        # Reset file pointer to beginning
        pdf_file_stream.seek(0)
        
        with pdfplumber.open(pdf_file_stream) as pdf:
            for page_num, page in enumerate(pdf.pages):
                try:
                    # Method 1: Try to extract tables first (for Excel-converted PDFs)
                    tables = page.extract_tables()
                    
                    if tables:
                        print(f"Found {len(tables)} tables on page {page_num + 1}")
                        
                        for table_index, table in enumerate(tables):
                            if not table or len(table) < 2:  # Need at least header + 1 data row
                                continue
                                
                            # Get headers (first row)
                            headers = [str(cell).strip().lower() if cell else '' for cell in table[0]]
                            print(f"Table {table_index + 1} headers: {headers}")
                            
                            # Map common header variations to standard fields
                            header_mapping = {}
                            for i, header in enumerate(headers):
                                if any(keyword in header for keyword in ['roll', 'id', 'number', 'reg']):
                                    header_mapping['rollNumber'] = i
                                elif any(keyword in header for keyword in ['first name', 'firstname', 'first']):
                                    header_mapping['firstName'] = i
                                elif any(keyword in header for keyword in ['last name', 'lastname', 'last', 'surname']):
                                    header_mapping['lastName'] = i
                                elif any(keyword in header for keyword in ['name', 'student']) and 'first' not in header and 'last' not in header:
                                    header_mapping['name'] = i  # Full name in single column
                                elif any(keyword in header for keyword in ['email', 'mail']):
                                    header_mapping['email'] = i
                                elif any(keyword in header for keyword in ['department', 'dept', 'branch']):
                                    header_mapping['department'] = i
                                elif any(keyword in header for keyword in ['year', 'batch', 'semester', 'academic']):
                                    header_mapping['year'] = i
                                elif any(keyword in header for keyword in ['class', 'course']):
                                    header_mapping['class'] = i
                                elif any(keyword in header for keyword in ['div', 'division', 'section']):
                                    header_mapping['division'] = i
                            
                            print(f"Header mapping: {header_mapping}")
                            
                            # Extract student data from remaining rows
                            for row_index, row in enumerate(table[1:], start=1):
                                if not row or all(not cell or str(cell).strip() == '' for cell in row):
                                    continue  # Skip empty rows
                                
                                student = {}
                                
                                # Extract data based on header mapping
                                if 'rollNumber' in header_mapping:
                                    roll_cell = row[header_mapping['rollNumber']]
                                    if roll_cell:
                                        student['rollNumber'] = str(roll_cell).strip()
                                
                                # Handle separate first/last name columns
                                if 'firstName' in header_mapping and 'lastName' in header_mapping:
                                    first_cell = row[header_mapping['firstName']] if header_mapping['firstName'] < len(row) else None
                                    last_cell = row[header_mapping['lastName']] if header_mapping['lastName'] < len(row) else None
                                    
                                    first_name = str(first_cell).strip() if first_cell else ''
                                    last_name = str(last_cell).strip() if last_cell else ''
                                    
                                    if first_name or last_name:
                                        student['name'] = f"{first_name} {last_name}".strip()
                                
                                # Handle single name column (fallback)
                                elif 'name' in header_mapping and not student.get('name'):
                                    name_cell = row[header_mapping['name']]
                                    if name_cell:
                                        student['name'] = str(name_cell).strip()
                                
                                # Handle other fields
                                if 'email' in header_mapping:
                                    email_cell = row[header_mapping['email']]
                                    if email_cell:
                                        student['email'] = str(email_cell).strip()
                                
                                if 'department' in header_mapping:
                                    dept_cell = row[header_mapping['department']]
                                    if dept_cell:
                                        student['department'] = str(dept_cell).strip()
                                
                                if 'year' in header_mapping:
                                    year_cell = row[header_mapping['year']]
                                    if year_cell:
                                        student['year'] = str(year_cell).strip()
                                
                                if 'class' in header_mapping:
                                    class_cell = row[header_mapping['class']]
                                    if class_cell:
                                        student['class'] = str(class_cell).strip()
                                
                                if 'division' in header_mapping:
                                    div_cell = row[header_mapping['division']]
                                    if div_cell:
                                        student['division'] = str(div_cell).strip()
                                
                                # If no header mapping worked, try positional extraction
                                if not student.get('rollNumber') and len(row) > 0 and row[0]:
                                    student['rollNumber'] = str(row[0]).strip()
                                
                                # Try to construct name from positions if not already set
                                if not student.get('name'):
                                    if len(row) > 1 and row[1] and len(row) > 2 and row[2]:
                                        # Assume positions: roll_no, first_name, last_name
                                        first_name = str(row[1]).strip() if row[1] else ''
                                        last_name = str(row[2]).strip() if row[2] else ''
                                        if first_name or last_name:
                                            student['name'] = f"{first_name} {last_name}".strip()
                                    elif len(row) > 1 and row[1]:
                                        # Single name column
                                        student['name'] = str(row[1]).strip()
                                
                                # Handle other positional data
                                if not student.get('email') and len(row) > 3 and row[3]:
                                    potential_email = str(row[3]).strip()
                                    if '@' in potential_email:  # Basic email check
                                        student['email'] = potential_email
                                
                                # Set defaults for missing fields
                                student.setdefault('email', '')
                                student.setdefault('department', '')
                                student.setdefault('year', '')
                                student.setdefault('class', '')
                                student.setdefault('division', '')
                                
                                # Validate and add student
                                if student.get('rollNumber') and student.get('name'):
                                    # Clean up the data
                                    student['rollNumber'] = student['rollNumber'].replace('None', '').strip()
                                    student['name'] = student['name'].replace('None', '').strip()
                                    
                                    if student['rollNumber'] and student['name']:
                                        students.append(student)
                                        print(f"Extracted student: {student}")
                    
                    # Method 2: Fallback to text extraction if no tables found
                    if not tables:
                        text = page.extract_text()
                        if text:
                            students.extend(extract_students_from_text(text))
                            
                except Exception as page_error:
                    print(f"Error processing page {page_num + 1}: {page_error}")
                    continue
                    
    except Exception as e:
        print(f"Error processing PDF: {e}")
        traceback.print_exc()
        return []

    print(f"Total extracted students: {len(students)}")
    return students

def extract_students_from_text(text):
    """
    Fallback method to extract students from plain text
    (for PDFs that don't have proper table structure)
    """
    students = []
    lines = text.splitlines()
    
    # Try different patterns to extract student data
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        student = {}
        
        # Pattern 1: Roll No: XXX, Name: YYY, Email: ZZZ
        if "roll" in line.lower() and ("name" in line.lower() or "student" in line.lower()):
            parts = line.split(',')
            for part in parts:
                part = part.strip()
                if part.lower().startswith('roll'):
                    roll_match = part.split(':')
                    if len(roll_match) > 1:
                        student['rollNumber'] = roll_match[1].strip()
                elif part.lower().startswith('name'):
                    name_match = part.split(':')
                    if len(name_match) > 1:
                        student['name'] = name_match[1].strip()
                elif part.lower().startswith('email'):
                    email_match = part.split(':')
                    if len(email_match) > 1:
                        student['email'] = email_match[1].strip()
                elif part.lower().startswith('department') or part.lower().startswith('dept'):
                    dept_match = part.split(':')
                    if len(dept_match) > 1:
                        student['department'] = dept_match[1].strip()
                elif part.lower().startswith('year'):
                    year_match = part.split(':')
                    if len(year_match) > 1:
                        student['year'] = year_match[1].strip()
        
        # Pattern 2: Separated by multiple spaces, | or tabs
        elif '|' in line or '\t' in line or '  ' in line:
            # Choose the best separator
            separator = '|' if '|' in line else '\t' if '\t' in line else '  '
            parts = [p.strip() for p in line.split(separator) if p.strip()]
            
            if len(parts) >= 2:
                # Assume first part is roll number, second is name
                if parts[0] and any(c.isdigit() for c in parts[0]):
                    student['rollNumber'] = parts[0]
                if len(parts) > 1:
                    student['name'] = parts[1]
                if len(parts) > 2:
                    student['email'] = parts[2]
                if len(parts) > 3:
                    student['department'] = parts[3]
                if len(parts) > 4:
                    student['year'] = parts[4]
        
        # Pattern 3: Space-separated with roll number pattern
        elif any(c.isdigit() for c in line) and len(line.split()) >= 2:
            words = line.split()
            # Look for roll number pattern (contains digits and letters)
            for i, word in enumerate(words):
                if any(c.isdigit() for c in word) and any(c.isalpha() for c in word):
                    student['rollNumber'] = word
                    # Assume the rest is name
                    if i + 1 < len(words):
                        student['name'] = ' '.join(words[i+1:])
                    break
        
        # Add student if we have minimum required info
        if student.get('rollNumber') and student.get('name'):
            # Set defaults for missing fields
            student.setdefault('email', '')
            student.setdefault('department', '')
            student.setdefault('year', '')
            students.append(student)

    return students

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
        # Reset file pointer to beginning
        pdf_file_stream.seek(0)
        
        with pdfplumber.open(pdf_file_stream) as pdf:
            for page_num, page in enumerate(pdf.pages):
                try:
                    # Method 1: Try to extract tables first (for structured question PDFs)
                    tables = page.extract_tables()
                    
                    if tables:
                        print(f"Found {len(tables)} tables on page {page_num + 1}")
                        
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
                    text = page.extract_text()
                    if text:
                        text_questions = extract_questions_from_text(text)
                        questions.extend(text_questions)
                        
                except Exception as page_error:
                    print(f"Error processing page {page_num + 1}: {page_error}")
                    continue
                    
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
    
    import re
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

@app.route("/api/extract-students", methods=["POST", "OPTIONS"])
def extract_students():
    """Extract student information from uploaded PDF"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        # Check if a file was included in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]

        # Check if the filename is empty (no file selected)
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Check if the file is a PDF
        if not (file and file.filename.lower().endswith('.pdf')):
            return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400

        # Check file size (limit to 10MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({"error": "File too large. Maximum size is 10MB."}), 400

        # Extract students from PDF
        students = extract_students_from_pdf(file)
        
        if not students:
            return jsonify({
                "message": "Successfully processed PDF, but no student data in the expected format were found.",
                "students": [],
                "count": 0
            }), 200
            
        return jsonify({
            "students": students,
            "count": len(students),
            "message": f"Successfully extracted {len(students)} students"
        }), 200
        
    except Exception as e:
        print(f"Unexpected error in extract_students: {e}")
        print(f"Error type: {type(e)}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error occurred while processing the file"}), 500

@app.route("/api/upload", methods=["POST", "OPTIONS"])
def upload_file():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        # Check if a file was included in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]

        # Check if the filename is empty (no file selected)
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Check if the file is a PDF
        if not (file and file.filename.lower().endswith('.pdf')):
            return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400

        # Check file size (limit to 10MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({"error": "File too large. Maximum size is 10MB."}), 400

        # Extract questions from PDF
        questions = extract_questions_from_pdf(file)
        
        if not questions:
            return jsonify({
                "message": "Successfully processed PDF, but no questions in the expected format were found.",
                "questions": [],
                "count": 0
            }), 200
            
        return jsonify({
            "questions": questions,
            "count": len(questions),
            "message": f"Successfully extracted {len(questions)} questions"
        }), 200
        
    except Exception as e:
        print(f"Unexpected error in upload_file: {e}")
        print(f"Error type: {type(e)}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error occurred while processing the file"}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({"status": "healthy", "message": "PDF processing service is running"}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# For local development
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

