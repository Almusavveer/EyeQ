from flask import Flask, request, jsonify
import pdfplumber
from flask_cors import CORS
import io
import sys
import traceback

# Initialize Flask app
app = Flask(__name__)

# Configure CORS with specific settings for production
CORS(app, origins=["https://eye-q-black.vercel.app", "http://localhost:5174", "http://127.0.0.1:5174"])

def extract_questions_from_pdf(pdf_file_stream):
    """
    Extracts questions, options, and answers from a PDF file stream.
    Now with more robust parsing logic and error handling.
    """
    all_text = ""
    try:
        # Reset file pointer to beginning
        pdf_file_stream.seek(0)
        
        # pdfplumber.open() can accept a file-like object directly
        with pdfplumber.open(pdf_file_stream) as pdf:
            for page in pdf.pages:
                try:
                    text = page.extract_text()
                    if text:
                        all_text += text + "\n"
                except Exception as page_error:
                    print(f"Error processing page: {page_error}")
                    continue
                    
    except Exception as e:
        print(f"Error processing PDF: {e}")
        print(f"Error type: {type(e)}")
        traceback.print_exc()
        return []

    if not all_text.strip():
        print("No text extracted from PDF")
        return []

    questions = []
    current_question = None

    for line in all_text.splitlines():
        line = line.strip()
        
        # More robust check for a question
        if line.upper().startswith('Q') and len(line) > 1 and (line[1].isdigit() or line[1] in '. '):
            if current_question:
                questions.append(current_question)
            current_question = {"question": line, "options": [], "answer": ""}
        elif line.startswith(("A.", "B.", "C.", "D.")):
            if current_question:
                current_question["options"].append(line)
        elif line.lower().startswith("answer:"):
            if current_question:
                current_question["answer"] = line[len("Answer:"):].strip()

    # Append the last question
    if current_question:
        questions.append(current_question)

    print(f"Extracted {len(questions)} questions from PDF")
    return questions

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

