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
    Extract all text from PDF file stream with improved character handling
    Returns: extracted text as string
    """
    all_text = ""
    try:
        # Reset file pointer to beginning
        pdf_file_stream.seek(0)
        
        with pdfplumber.open(pdf_file_stream) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    text = page.extract_text()
                    if text:
                        # Log original text issues for debugging (first 200 chars)
                        original_preview = text[:200] if len(text) > 200 else text
                        
                        # Clean up problematic Unicode characters
                        cleaned_text = clean_pdf_text(text)
                        
                        # Log if significant changes were made
                        if original_preview != cleaned_text[:200]:
                            print(f"Page {page_num}: Cleaned text encoding issues")
                            # Log specific issues found (for debugging)
                            if 'Ɵ' in original_preview or '(cid:' in original_preview:
                                print(f"  Found encoding issues: {original_preview[:100]}...")
                        
                        all_text += cleaned_text + "\n"
                except Exception as page_error:
                    print(f"Error processing page {page_num}: {page_error}")
                    continue
                    
    except Exception as e:
        print(f"Error processing PDF: {e}")
        traceback.print_exc()
        return ""

    final_text = all_text.strip()
    print(f"PDF extraction complete: {len(final_text)} characters extracted")
    return final_text

def clean_pdf_text(text):
    """
    Clean up common PDF text extraction issues with comprehensive character mapping
    This handles various PDF encoding issues users might encounter
    """
    # Comprehensive character replacements for PDF extraction issues
    char_replacements = {
        # Common Unicode substitutions
        'Ɵ': 't', 'ƞ': 'n', 'Ɨ': 'i', 'ƒ': 'f', 'Ş': 'S', 'ş': 's',
        'Ğ': 'G', 'ğ': 'g', 'İ': 'I', 'ı': 'i', 'Ö': 'O', 'ö': 'o',
        'Ü': 'U', 'ü': 'u', 'Ç': 'C', 'ç': 'c',
        
        # Smart quotes and punctuation
        '"': '"', '"': '"', ''': "'", ''': "'", '–': '-', '—': '-',
        '…': '...', '•': '-', '‚': ',', '„': '"', '‹': '<', '›': '>',
        
        # Mathematical and special symbols
        '×': 'x', '÷': '/', '±': '+/-', '≤': '<=', '≥': '>=', '≠': '!=',
        '≈': '~', '∞': 'infinity', '∑': 'sum', '∏': 'product',
        
        # Degree and other symbols
        '°': 'degrees', '©': '(c)', '®': '(R)', '™': '(TM)', '§': 'section',
        
        # Arrows and symbols that might appear in technical documents
        '→': '->', '←': '<-', '↑': 'up', '↓': 'down', '↔': '<->',
    }
    
    # Apply character replacements
    for old_char, new_char in char_replacements.items():
        text = text.replace(old_char, new_char)
    
    # Handle CID font mapping issues (more comprehensive)
    import re
    
    # Remove CID font references with flexible numbers
    text = re.sub(r'\(cid:\d+\)', 't', text)  # Default to 't' as it's most common
    
    # Handle specific CID mappings if we can identify patterns
    cid_patterns = {
        r'\(cid:41[0-9]\)': 't',  # 410-419 range often maps to 't'
        r'\(cid:42[0-9]\)': 'n',  # 420-429 range often maps to 'n'
        r'\(cid:43[0-9]\)': 'i',  # 430-439 range often maps to 'i'
        r'\(cid:44[0-9]\)': 'o',  # 440-449 range often maps to 'o'
        r'\(cid:45[0-9]\)': 'a',  # 450-459 range often maps to 'a'
    }
    
    for pattern, replacement in cid_patterns.items():
        text = re.sub(pattern, replacement, text)
    
    # Handle garbled text patterns that commonly occur
    garbled_patterns = {
        r'func\S*on': 'function',  # funcƟon, funcƞon, etc.
        r'quest\S*on': 'question', # questƟon, etc.
        r'opera\S*on': 'operation', # operaƟon, etc.
        r'implementa\S*on': 'implementation', # implementaƟon, etc.
        r'informa\S*on': 'information', # informaƟon, etc.
        r'condi\S*on': 'condition', # condiƟon, etc.
        r'sec\S*on': 'section', # secƟon, etc.
        r'por\S*on': 'portion', # porƟon, etc.
        r'posi\S*on': 'position', # posiƟon, etc.
        r'op\S*on': 'option', # opƟon, etc.
        r'wri\S*ng': 'writing', # wriƟng, etc.
        r'prin\S*\(': 'printf(',  # prinƞ(, prinƟ(, etc.
        r'sta\S*c': 'static', # staƟc, etc.
        r'vola\S*le': 'volatile', # volaƟle, etc.
    }
    
    for pattern, replacement in garbled_patterns.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    # Clean up whitespace issues
    text = re.sub(r' +', ' ', text)  # Multiple spaces to single space
    text = re.sub(r'\n +', '\n', text)  # Remove spaces at start of lines
    text = re.sub(r' +\n', '\n', text)  # Remove spaces at end of lines
    text = re.sub(r'\n{3,}', '\n\n', text)  # Limit consecutive newlines
    
    # Fix common programming syntax issues in code snippets
    code_fixes = {
        r'#include\s*<\s*stdio\.h\s*>': '#include <stdio.h>',
        r'#include\s*<\s*stdlib\.h\s*>': '#include <stdlib.h>',
        r'#include\s*<\s*string\.h\s*>': '#include <string.h>',
        r'#include\s*<\s*math\.h\s*>': '#include <math.h>',
        r'int\s+main\s*\(\s*\)': 'int main()',
        r'return\s+0\s*;': 'return 0;',
    }
    
    for pattern, replacement in code_fixes.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    return text.strip()

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