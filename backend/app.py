"""
Main Flask application with clean routes
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import os

# Import configuration
from config import CORS_ORIGINS, DEBUG, HOST, PORT, SECRET_KEY

# Import logging configuration
from logging_config import setup_logging, get_logger

# Import services
from services.pdf_utils import validate_pdf_file
from services.student_service import extract_students_from_pdf
from services.question_service import extract_questions_from_pdf
from services.firebase_service import firebase_service

# Initialize logging
log_level = "DEBUG" if DEBUG else "INFO"
setup_logging("eyeq_backend", log_level)
logger = get_logger("app")

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure CORS
CORS(app, origins=CORS_ORIGINS)

# Add security headers
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    if not DEBUG:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

logger.info(f"EyeQ Backend starting with DEBUG={DEBUG}, CORS_ORIGINS={CORS_ORIGINS}")

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
            "upload": "/api/upload",
            "submit_exam": "/api/submit-exam",
            "get_exam_results": "/api/get-exam-results",
            "get_student_result": "/api/get-student-result"
        }
    }), 200

@app.route("/api/extract-students", methods=["POST", "OPTIONS"])
def extract_students():
    """Extract student information from uploaded PDF"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        logger.info("Student extraction request received")
        
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
        logger.info(f"Extracted {len(students)} students from PDF")
        
        if not students:
            logger.info("No student data found in PDF")
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
        logger.error(f"Error in extract_students: {str(e)}", exc_info=True)
        return jsonify({
            "error": "An error occurred while processing the PDF. Please try again.",
            "details": str(e) if DEBUG else None
        }), 500

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
        traceback.print_exc()
        return jsonify({"error": "Internal server error occurred while processing the file"}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({"status": "healthy", "message": "PDF processing service is running"}), 200

@app.route("/api/submit-exam", methods=["POST", "OPTIONS"])
def submit_exam():
    """Submit exam results for storage"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Extract required fields
        student_id = data.get('studentId')
        exam_id = data.get('examId') 
        answers = data.get('answers', [])
        questions = data.get('questions', [])
        exam_duration = data.get('examDuration')
        time_taken = data.get('timeTaken')
        
        if not student_id or not answers:
            return jsonify({"error": "Student ID and answers are required"}), 400
            
        # Calculate score
        score = 0
        total_questions = len(questions)
        
        for answer in answers:
            question_text = answer.get('question')
            user_answer = answer.get('answer')
            
            # Find matching question
            matching_question = next((q for q in questions if q.get('text') == question_text), None)
            if matching_question and matching_question.get('correctAnswer') == user_answer:
                score += 1
                
        # Prepare result data for Firebase
        result_data = {
            "studentId": student_id,
            "examId": exam_id,
            "score": score,
            "totalQuestions": total_questions,
            "percentage": round((score / total_questions) * 100, 2) if total_questions > 0 else 0,
            "answers": answers,
            "questions": questions,
            "examDuration": exam_duration,
            "timeTaken": time_taken,
            "studentName": data.get('studentName', f'Student {student_id}'),
            "examTitle": data.get('examTitle', 'Exam')
        }
        
        
        # Save to Firebase
        success = firebase_service.submit_exam_result(result_data)
        
        if not success:
            return jsonify({"error": "Failed to save exam results"}), 500
        
        return jsonify({
            "success": True,
            "message": "Exam results submitted successfully",
            "score": score,
            "totalQuestions": total_questions,
            "percentage": result_data['percentage']
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to submit exam results"}), 500

@app.route("/api/get-exam-results", methods=["GET", "OPTIONS"])
def get_exam_results():
    """Get all exam results for teachers to view"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        # Get exam_id from query parameters if provided
        exam_id = request.args.get('examId')
        
        # Fetch results from Firebase
        results = firebase_service.get_exam_results(exam_id)
        
        return jsonify({
            "success": True,
            "results": results,
            "count": len(results)
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch exam results"}), 500

@app.route("/api/get-student-result", methods=["GET", "OPTIONS"])
def get_student_result():
    """Get specific student's exam result"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        student_id = request.args.get('studentId')
        exam_id = request.args.get('examId')
        
        if not student_id or not exam_id:
            return jsonify({"error": "Student ID and Exam ID are required"}), 400
        
        # Fetch student result from Firebase
        result = firebase_service.get_student_result(student_id, exam_id)
        
        if result:
            return jsonify({
                "success": True,
                "result": result
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "No result found for this student and exam"
            }), 404
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch student result"}), 500

@app.route("/api/exam-details/<exam_id>", methods=["GET", "OPTIONS"])
def get_exam_details(exam_id):
    """Get exam details from Firebase"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        exam_data = firebase_service.get_exam_details(exam_id)
        
        if exam_data:
            return jsonify({
                'success': True,
                'exam': exam_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Exam not found'
            }), 404
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/student-details/<creator_id>/<student_id>", methods=["GET", "OPTIONS"])
def get_student_details(creator_id, student_id):
    """Get student details from Firebase"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        student_data = firebase_service.get_student_details(creator_id, student_id)
        
        if student_data:
            return jsonify({
                'success': True,
                'student': student_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/create-user", methods=["POST", "OPTIONS"])
def create_user():
    """Create user in Firebase"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        user_data = request.json
        
        if not user_data:
            return jsonify({
                'success': False,
                'message': 'No user data provided'
            }), 400
        
        success = firebase_service.create_user(user_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'User created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to create user'
            }), 500
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/user/<user_id>", methods=["GET", "OPTIONS"])
def get_user(user_id):
    """Get user from Firebase"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        user_data = firebase_service.get_user(user_id)
        
        if user_data:
            return jsonify({
                'success': True,
                'user': user_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/students/<teacher_id>", methods=["GET", "OPTIONS"])
def get_students(teacher_id):
    """Get all students under a teacher"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        students = firebase_service.get_students(teacher_id)
        
        return jsonify({
            'success': True,
            'students': students,
            'count': len(students)
        })
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/students/<teacher_id>", methods=["POST", "OPTIONS"])
def add_student(teacher_id):
    """Add student under a teacher"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        student_data = request.json
        
        if not student_data:
            return jsonify({
                'success': False,
                'message': 'No student data provided'
            }), 400
        
        success = firebase_service.add_student(teacher_id, student_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Student added successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to add student'
            }), 500
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/students/<teacher_id>/<student_id>", methods=["DELETE", "OPTIONS"])
def delete_student(teacher_id, student_id):
    """Delete student from teacher's collection"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        success = firebase_service.delete_student(teacher_id, student_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Student deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to delete student'
            }), 500
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/debug/mock-storage", methods=["GET", "OPTIONS"])
def debug_mock_storage():
    """Debug endpoint to check mock storage state"""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        mock_data = firebase_service.mock_storage
        return jsonify({
            'mock_storage': mock_data,
            'students_keys': list(mock_data.get('students', {}).keys()),
            'total_teachers': len(mock_data.get('students', {})),
            'message': 'Mock storage debug info'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route("/api/test/create-student/<creator_id>/<student_id>", methods=["POST", "OPTIONS"])
def create_test_student(creator_id, student_id):
    """Create a test student for debugging purposes"""
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        # Create test student data
        student_data = {
            "studentId": student_id,  # For backward compatibility
            "rollNumber": student_id,  # Current standard
            "name": f"Test Student {student_id}",
            "email": f"student{student_id}@test.com",
            "class": "Test Class",
            "section": "A"
        }
        
        success = firebase_service.add_student(creator_id, student_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Test student {student_id} created successfully',
                'student': student_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to create test student'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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
    logger.info(f"Starting server on {HOST}:{PORT} with DEBUG={DEBUG}")
    app.run(debug=DEBUG, host=HOST, port=PORT)
