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
    # Comprehensive character replacements for PDF extraction issues (multi-language support)
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
        
        # Programming-related symbols that might get corrupted
        '→': '->', '←': '<-', '↑': 'up', '↓': 'down', '↔': '<->',
        '∧': '&&', '∨': '||', '¬': '!', '⊕': '^',  # Logical operators
        
        # Degree and other symbols
        '°': 'degrees', '©': '(c)', '®': '(R)', '™': '(TM)', '§': 'section',
        
        # Language-specific characters that might appear in programming contexts
        # French
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u',
        'ñ': 'n', 'ý': 'y', 'ÿ': 'y',
        
        # German
        'ß': 'ss',
        
        # Scandinavian
        'æ': 'ae', 'ø': 'o', 'å': 'a',
        'Æ': 'AE', 'Ø': 'O', 'Å': 'A',
        
        # Eastern European
        'ć': 'c', 'č': 'c', 'đ': 'd', 'š': 's', 'ž': 'z',
        'Ć': 'C', 'Č': 'C', 'Đ': 'D', 'Š': 'S', 'Ž': 'Z',
        
        # Cyrillic (basic mapping for common cases)
        'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x',
        'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'Х': 'X',
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
    
    # Preserve code block structure - don't collapse code formatting
    # Identify potential code blocks and preserve their formatting
    lines = text.split('\n')
    processed_lines = []
    in_code_block = False
    
    for line in lines:
        stripped_line = line.strip()
        
        # Detect start of code block
        if (any(keyword in stripped_line.lower() for keyword in ['public class', 'public static', '#include', 'int main', 'void main']) or
            stripped_line.endswith('{') or
            stripped_line.startswith('System.') or
            stripped_line.startswith('printf(') or
            stripped_line.startswith('cout')):
            in_code_block = True
        
        # Detect end of code block
        if in_code_block and stripped_line == '}':
            in_code_block = False
            processed_lines.append(line)
            continue
        
        # Preserve code block formatting
        if in_code_block:
            processed_lines.append(line)  # Keep original formatting for code
        else:
            # Normal text processing
            processed_lines.append(line.strip() if line.strip() else '')
    
    text = '\n'.join(processed_lines)
    
    # Clean up whitespace issues (but preserve code structure)
    text = re.sub(r' +', ' ', text)  # Multiple spaces to single space (except in code)
    text = re.sub(r'\n{3,}', '\n\n', text)  # Limit consecutive newlines
    
    # Fix common programming syntax issues in code snippets (multi-language support)
    code_fixes = {
        # C/C++ patterns
        r'#include\s*<\s*stdio\.h\s*>': '#include <stdio.h>',
        r'#include\s*<\s*stdlib\.h\s*>': '#include <stdlib.h>',
        r'#include\s*<\s*string\.h\s*>': '#include <string.h>',
        r'#include\s*<\s*math\.h\s*>': '#include <math.h>',
        r'#include\s*<\s*iostream\s*>': '#include <iostream>',
        r'#include\s*<\s*vector\s*>': '#include <vector>',
        r'int\s+main\s*\(\s*\)': 'int main()',
        r'return\s+0\s*;': 'return 0;',
        r'using\s+namespace\s+std\s*;': 'using namespace std;',
        
        # Java patterns
        r'public\s+static\s+void\s+main': 'public static void main',
        r'public\s+class\s+': 'public class ',
        r'System\.out\.print': 'System.out.print',
        # Note: Do NOT change printf to println for C/C++ code!
        
        # Python patterns
        r'def\s+main\s*\(\s*\)': 'def main():',
        r'if\s+__name__\s*==\s*["\']__main__["\']\s*:': 'if __name__ == "__main__":',
        r'print\s*\(\s*': 'print(',
        
        # JavaScript patterns
        r'function\s+main\s*\(\s*\)': 'function main()',
        r'console\.log\s*\(': 'console.log(',
        r'let\s+': 'let ',
        r'const\s+': 'const ',
        r'var\s+': 'var ',
        
        # General programming fixes
        r'AN\d+\)': 'AND)',  # Fix truncated "AND" in bitwise operations
        r'OR\d+\)': 'OR)',   # Fix truncated "OR" in bitwise operations
        r'XOR\d+\)': 'XOR)', # Fix truncated "XOR" in bitwise operations
        
        # Common OCR errors in programming contexts
        r'automatcally': 'automatically',
        r'exceptons': 'exceptions',
        r'collecton': 'collection',
        r'primitve': 'primitive',
        r'Compilaton': 'Compilation',
        r'utl': 'util',
        r'functon': 'function',
        r'retum': 'return',
        r'pnnt': 'print',
        r'prmt': 'print',
        r'vanable': 'variable',
        r'declaraton': 'declaration',
        r'intializaton': 'initialization',
        r'iteraton': 'iteration',
        r'condton': 'condition',
        r'comparson': 'comparison',
        r'operaton': 'operation',
        r'allocaton': 'allocation',
        r'implementaton': 'implementation',
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