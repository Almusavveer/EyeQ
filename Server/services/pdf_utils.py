"""
Common PDF processing utilities
"""
import pdfplumber
import traceback
from config import MAX_FILE_SIZE_MB

def validate_pdf_file(file):
    """
    Validate uploaded PDF file
    Returns: (is_valid, error_message)
    """
    # Check if the filename is empty (no file selected)
    if file.filename == '':
        return False, "No file selected"

    # Check if the file is a PDF
    if not (file and file.filename.lower().endswith('.pdf')):
        return False, "Invalid file type. Please upload a PDF."

    # Check file size
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        return False, f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB."
    
    return True, None

def extract_text_from_pdf(pdf_file_stream):
    """
    Extract all text from PDF file stream
    Returns: extracted text as string
    """
    all_text = ""
    try:
        # Reset file pointer to beginning
        pdf_file_stream.seek(0)
        
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
        traceback.print_exc()
        return ""

    return all_text.strip()

def extract_tables_from_pdf(pdf_file_stream):
    """
    Extract all tables from PDF file stream
    Returns: list of tables from all pages
    """
    all_tables = []
    
    try:
        # Reset file pointer to beginning
        pdf_file_stream.seek(0)
        
        with pdfplumber.open(pdf_file_stream) as pdf:
            for page_num, page in enumerate(pdf.pages):
                try:
                    tables = page.extract_tables()
                    if tables:
                        print(f"Found {len(tables)} tables on page {page_num + 1}")
                        all_tables.extend(tables)
                except Exception as page_error:
                    print(f"Error processing page {page_num + 1}: {page_error}")
                    continue
                    
    except Exception as e:
        print(f"Error extracting tables from PDF: {e}")
        traceback.print_exc()
        return []

    return all_tables