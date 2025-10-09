"""
Student PDF processing service
"""
import traceback
from .pdf_utils import extract_tables_from_pdf, extract_text_from_pdf

def extract_students_from_pdf(pdf_file_stream):
    """
    Extracts student information from a PDF file stream.
    Enhanced to handle tabular format PDFs (Excel converted to PDF).
    Supports both table extraction and text-based patterns.
    """
    students = []
    
    try:
        # Method 1: Try to extract tables first (for Excel-converted PDFs)
        tables = extract_tables_from_pdf(pdf_file_stream)
        
        if tables:
            for table_index, table in enumerate(tables):
                if not table or len(table) < 2:  # Need at least header + 1 data row
                    continue
                    
                # Get headers (first row)
                headers = [str(cell).strip().lower() if cell else '' for cell in table[0]]
                
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
        
        # Method 2: Fallback to text extraction if no tables found
        if not tables:
            text = extract_text_from_pdf(pdf_file_stream)
            if text:
                students.extend(extract_students_from_text(text))
                
    except Exception as e:
        traceback.print_exc()
        return []

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
