"""
Main Flask application with clean routes
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# Import configuration
from config import CORS_ORIGINS, DEBUG, HOST, PORT

# Import services
from services.pdf_utils import validate_pdf_file
from services.student_service import extract_students_from_pdf
from services.question_service import extract_questions_from_pdf

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=CORS_ORIGINS)

@app.route("/", methods=["GET"])
def root():
    """Root endpoint - API information"""
    return jsonify({
        "message": "EyeQ Backend API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "extract_students": "/api/extract-students",
            "upload": "/api/upload"
        }
    }), 200

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

        # Validate PDF file
        is_valid, error_message = validate_pdf_file(file)
        if not is_valid:
            return jsonify({"error": error_message}), 400

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
    """Extract questions from uploaded PDF"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        # Check if a file was included in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]

        # Validate PDF file
        is_valid, error_message = validate_pdf_file(file)
        if not is_valid:
            return jsonify({"error": error_message}), 400

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
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500

# For local development
if __name__ == "__main__":
    app.run(debug=DEBUG, host=HOST, port=PORT)