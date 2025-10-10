"""
Main Flask application with database integration
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# Import configuration
from config import CORS_ORIGINS, DEBUG, HOST, PORT, DATABASE_URI

# Import services
from services.pdf_utils import validate_pdf_file
from services.student_service import extract_students_from_pdf
from services.question_service import extract_questions_from_pdf

# Import models
from models import db, Student, Exam, Question, StudentAnswer

# Initialize Flask app
app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Configure CORS
CORS(app, origins=CORS_ORIGINS)

# Create tables
with app.app_context():
    db.create_all()

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

# Database API routes
@app.route("/api/student/me", methods=["GET"])
def get_current_student():
    """Get current student information"""
    # In a real app, this would get the student from session/auth
    student = Student.query.filter_by(roll_number="123456").first()
    if not student:
        # Create a mock student if not exists
        student = Student(
            roll_number="123456",
            name="Alex Doe",
            email="alex.doe@example.com",
            department="Computer Science",
            year="3rd Year",
            class_name="CS101",
            division="A"
        )
        db.session.add(student)
        db.session.commit()

    return jsonify({
        "id": student.roll_number,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "year": student.year,
        "class": student.class_name,
        "division": student.division
    })

@app.route("/api/exam", methods=["GET"])
def get_exam():
    """Get the current exam with questions"""
    # In a real app, this would get the exam based on some criteria
    exam = Exam.query.first()
    if not exam:
        # Create a mock exam if not exists
        exam = Exam(title="Biology 101 Final Exam", created_by=1)
        db.session.add(exam)
        db.session.commit()

        # Add some sample questions
        sample_questions = [
            {
                "question": "What is the powerhouse of the cell?",
                "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
                "correct_answer": "Mitochondria"
            },
            {
                "question": "Which of the following is a prokaryotic cell?",
                "options": ["Plant cell", "Animal cell", "Bacterial cell", "Fungal cell"],
                "correct_answer": "Bacterial cell"
            },
            {
                "question": "What is the process by which plants make their own food?",
                "options": ["Respiration", "Photosynthesis", "Transpiration", "Osmosis"],
                "correct_answer": "Photosynthesis"
            }
        ]

        for q_data in sample_questions:
            question = Question(
                exam_id=exam.id,
                question_text=q_data["question"],
                options=q_data["options"],
                correct_answer=q_data["correct_answer"],
                question_type="multiple-choice"
            )
            db.session.add(question)
        db.session.commit()

    questions = Question.query.filter_by(exam_id=exam.id).all()
    questions_data = []
    for q in questions:
        questions_data.append({
            "text": q.question_text,
            "options": q.options
        })

    return jsonify({
        "title": exam.title,
        "questions": questions_data
    })

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
