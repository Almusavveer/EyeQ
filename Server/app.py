from flask import Flask, request, jsonify
import pdfplumber
from flask_cors import CORS
import io

# Best practice to name the main Flask file index.py inside an /api folder for Vercel
app = Flask(__name__)
CORS(app)  # Allow frontend requests


def extract_questions_from_pdf(pdf_file_stream):
    """
    Extracts questions, options, and answers from a PDF file stream.
    Now with more robust parsing logic.
    """
    all_text = ""
    try:
        # pdfplumber.open() can accept a file-like object directly
        with pdfplumber.open(pdf_file_stream) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text += text + "\n"
    except Exception as e:
        # Handle cases where the file is not a valid PDF
        print(f"Error processing PDF: {e}")
        return []

    questions = []
    current_question = None

    for line in all_text.splitlines():
        line = line.strip()
        
        # More robust check for a question (e.g., "Q1.", "Q 1.", "Q.", "Question 1")
        # Checks if it starts with 'Q' and is followed by a digit, space, or period.
        if line.upper().startswith('Q') and len(line) > 1 and (line[1].isdigit() or line[1] in '. '):
            if current_question:
                questions.append(current_question)
            current_question = {"question": line, "options": [], "answer": ""}
        elif line.startswith(("A.", "B.", "C.", "D.")):
            if current_question:
                current_question["options"].append(line)
        # Handles "Answer:" regardless of case (e.g., "answer:", "ANSWER:")
        elif line.lower().startswith("answer:"):
            if current_question:
                # Strips "Answer:" from the beginning of the string to get the value
                current_question["answer"] = line[len("Answer:"):].strip()

    # Append the last question after the loop finishes
    if current_question:
        questions.append(current_question)

    return questions


# Standard route for Vercel serverless functions
@app.route("/api/upload", methods=["POST"])
def upload_file():
    # 1. Check if a file was included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    # 2. Check if the filename is empty (no file selected)
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # 3. Check if the file is a PDF
    if file and file.filename.lower().endswith('.pdf'):
        # Pass the file stream directly to the extraction function
        questions = extract_questions_from_pdf(file)
        if not questions:
            return jsonify({"message": "Successfully processed PDF, but no questions in the expected format were found."})
        return jsonify(questions)
    else:
        return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400

# Note: The 'if __name__ == "__main__":' block is not needed for Vercel,
# as Vercel imports the 'app' object and runs it. You can keep it for local testing.
if __name__ == "__main__":
    app.run(debug=True)

