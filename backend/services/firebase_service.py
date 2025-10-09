"""
Firebase service for exam results storage and retrieval
"""
import os
import json
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, List, Optional

class FirebaseService:
    def __init__(self):
        self.db = None
        # Mock storage for when Firebase is not available
        self.mock_storage = {
            'students': {},  # teacher_id -> list of students
            'exam_results': [],
            'users': {}
        }
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Try to get credentials from individual environment variables first
                firebase_type = os.getenv('FIREBASE_TYPE')
                firebase_project_id = os.getenv('FIREBASE_PROJECT_ID')
                firebase_private_key_id = os.getenv('FIREBASE_PRIVATE_KEY_ID')
                firebase_private_key = os.getenv('FIREBASE_PRIVATE_KEY')
                firebase_client_email = os.getenv('FIREBASE_CLIENT_EMAIL')
                firebase_client_id = os.getenv('FIREBASE_CLIENT_ID')
                firebase_auth_uri = os.getenv('FIREBASE_AUTH_URI')
                firebase_token_uri = os.getenv('FIREBASE_TOKEN_URI')
                firebase_auth_provider_cert_url = os.getenv('FIREBASE_AUTH_PROVIDER_X509_CERT_URL')
                firebase_client_cert_url = os.getenv('FIREBASE_CLIENT_X509_CERT_URL')
                
                if all([firebase_type, firebase_project_id, firebase_private_key, firebase_client_email]):
                    # Build credentials dictionary from environment variables
                    cred_dict = {
                        "type": firebase_type,
                        "project_id": firebase_project_id,
                        "private_key_id": firebase_private_key_id,
                        "private_key": firebase_private_key.replace('\\n', '\n'),  # Fix newlines
                        "client_email": firebase_client_email,
                        "client_id": firebase_client_id,
                        "auth_uri": firebase_auth_uri,
                        "token_uri": firebase_token_uri,
                        "auth_provider_x509_cert_url": firebase_auth_provider_cert_url,
                        "client_x509_cert_url": firebase_client_cert_url
                    }
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase initialized with environment variables")
                else:
                    # Try to get credentials from environment variable (JSON string)
                    firebase_creds = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
                    
                    if firebase_creds:
                        # Parse JSON credentials from environment variable
                        cred_dict = json.loads(firebase_creds)
                        cred = credentials.Certificate(cred_dict)
                        firebase_admin.initialize_app(cred)
                        print("✅ Firebase initialized with JSON string")
                    else:
                        # Fallback: try to find service account file
                        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', './firebase-service-account.json')
                        if os.path.exists(service_account_path):
                            cred = credentials.Certificate(service_account_path)
                            firebase_admin.initialize_app(cred)
                            print("✅ Firebase initialized with service account file")
                        else:
                            print("❌ No Firebase credentials found, using mock storage")
                            return
            
            self.db = firestore.client()
            print("✅ Firestore client connected successfully")
            
        except Exception as e:
            # Firebase initialization failed, will use mock storage
            print(f"❌ Firebase initialization failed: {str(e)}")
            self.db = None
    
    def submit_exam_result(self, result_data: Dict) -> bool:
        """
        Submit exam result to Firebase
        
        Args:
            result_data: Dictionary containing exam result data
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.db:
            return True
            
        try:
            # Add timestamp
            result_data['submittedAt'] = datetime.now()
            result_data['submittedAtISO'] = datetime.now().isoformat()
            
            # Save to Firebase collection 'examResults'
            doc_ref = self.db.collection('examResults').add(result_data)
            
            return True
            
        except Exception as e:
            return False
    
    def get_exam_results(self, exam_id: Optional[str] = None) -> List[Dict]:
        """
        Get exam results from Firebase
        
        Args:
            exam_id: Optional exam ID to filter by
            
        Returns:
            List of exam results
        """
        if not self.db:
            # Return mock data if Firebase not available
            return [{
                "id": "mock_result_1",
                "studentId": "student_001",
                "studentName": "Mock Student",
                "examId": "exam_001",
                "examTitle": "Mock Exam",
                "score": 8,
                "totalQuestions": 10,
                "percentage": 80.0,
                "timeTaken": 15,
                "submittedAt": "2025-01-08T10:30:00Z",
                "answers": []
            }]
        
        try:
            query = self.db.collection('examResults')
            
            if exam_id:
                query = query.where('examId', '==', exam_id)
            
            # Order by submission time (newest first)
            query = query.order_by('submittedAt', direction=firestore.Query.DESCENDING)
            
            results = []
            docs = query.stream()
            
            for doc in docs:
                result = doc.to_dict()
                result['id'] = doc.id
                results.append(result)
            
            return results
            
        except Exception as e:
            return []
    
    def get_student_result(self, student_id: str, exam_id: str) -> Optional[Dict]:
        """
        Get specific student's exam result
        
        Args:
            student_id: Student identifier
            exam_id: Exam identifier
            
        Returns:
            Student's exam result or None
        """
        if not self.db:
            return None
            
        try:
            query = self.db.collection('examResults') \
                .where('studentId', '==', student_id) \
                .where('examId', '==', exam_id) \
                .limit(1)
            
            docs = list(query.stream())
            
            if docs:
                result = docs[0].to_dict()
                result['id'] = docs[0].id
                return result
            
            return None
            
        except Exception as e:
            return None
    
    def get_exam_details(self, exam_id: str) -> Optional[Dict]:
        """
        Get exam details from Firebase
        
        Args:
            exam_id: Exam identifier
            
        Returns:
            Exam details or None
        """
        if not self.db:
            # Return mock exam data if Firebase not available
            return {
                "examId": exam_id,
                "examTitle": "Mock Exam",
                "examDuration": 20,
                "questions": [
                    {
                        "id": 1,
                        "text": "What is the capital of India?",
                        "options": ["Delhi", "Mumbai", "Kolkata", "Chennai"],
                        "correctAnswer": "Delhi"
                    }
                ],
                "createdBy": "mock_teacher",
                "createdAt": "2025-01-08T10:00:00Z"
            }
        
        try:
            doc_ref = self.db.collection('examDetails').document(exam_id)
            doc = doc_ref.get()
            
            if doc.exists:
                exam_data = doc.to_dict()
                exam_data['examId'] = exam_id
                return exam_data
            else:
                return None
                
        except Exception as e:
            return None
    
    def get_student_details(self, creator_id: str, student_id: str) -> Optional[Dict]:
        """
        Get student details from Firebase
        
        Args:
            creator_id: Teacher/creator identifier
            student_id: Student identifier
            
        Returns:
            Student details or None
        """
        if not self.db:
            return {
                "studentId": student_id,
                "name": "Mock Student",
                "email": "mock@example.com"
            }
        
        try:
            # Query students collection under the creator
            # Try both studentId and rollNumber fields (for backward compatibility)
            query = self.db.collection('users').document(creator_id) \
                .collection('students') \
                .where('studentId', '==', student_id) \
                .limit(1)
            
            docs = list(query.stream())
            
            # If not found with studentId, try rollNumber
            if not docs:
                query = self.db.collection('users').document(creator_id) \
                    .collection('students') \
                    .where('rollNumber', '==', student_id) \
                    .limit(1)
                
                docs = list(query.stream())
            
            if docs:
                student_data = docs[0].to_dict()
                student_data['id'] = docs[0].id
                return student_data
            else:
                return None
                
        except Exception as e:
            return None
    
    def create_user(self, user_data: Dict) -> bool:
        """
        Create user in Firebase
        
        Args:
            user_data: User information
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.db:
            return True
        
        try:
            user_id = user_data.get('uid')
            if not user_id:
                return False
            
            # Add timestamp
            user_data['createdAt'] = datetime.now()
            user_data['createdAtISO'] = datetime.now().isoformat()
            
            # Save to Firebase users collection
            self.db.collection('users').document(user_id).set(user_data)
            
            return True
            
        except Exception as e:
            return False
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """
        Get user from Firebase
        
        Args:
            user_id: User identifier
            
        Returns:
            User data or None
        """
        if not self.db:
            return {
                "uid": user_id,
                "name": "Mock User",
                "email": "mock@example.com",
                "role": "student"
            }
        
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                user_data = doc.to_dict()
                user_data['uid'] = user_id
                return user_data
            else:
                return None
                
        except Exception as e:
            return None
    
    def get_students(self, teacher_id: str) -> List[Dict]:
        """
        Get all students under a teacher
        
        Args:
            teacher_id: Teacher identifier
            
        Returns:
            List of student data
        """
        if not self.db:
            # Return actual students from mock storage
            students = self.mock_storage['students'].get(teacher_id, [])
            return students
        
        try:
            students_ref = self.db.collection('users').document(teacher_id).collection('students')
            docs = students_ref.stream()
            
            students = []
            for doc in docs:
                student_data = doc.to_dict()
                student_data['id'] = doc.id
                students.append(student_data)
            
            return students
            
        except Exception as e:
            return []
    
    def add_student(self, teacher_id: str, student_data: Dict) -> bool:
        """
        Add student under a teacher
        
        Args:
            teacher_id: Teacher identifier
            student_data: Student information
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.db:
            # Use mock storage
            if teacher_id not in self.mock_storage['students']:
                self.mock_storage['students'][teacher_id] = []
            
            # Add timestamp and ID
            student_data['createdAt'] = datetime.now().isoformat()
            student_data['id'] = f"mock_student_{len(self.mock_storage['students'][teacher_id]) + 1}"
            
            self.mock_storage['students'][teacher_id].append(student_data)
            return True
        
        try:
            # Add timestamp
            student_data['createdAt'] = datetime.now()
            student_data['createdAtISO'] = datetime.now().isoformat()
            
            # Add to teacher's students collection
            students_ref = self.db.collection('users').document(teacher_id).collection('students')
            students_ref.add(student_data)
            
            return True
            
        except Exception as e:
            return False
    
    def delete_student(self, teacher_id: str, student_id: str) -> bool:
        """
        Delete student from teacher's collection
        
        Args:
            teacher_id: Teacher identifier
            student_id: Student document ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.db:
            return True
        
        try:
            student_ref = self.db.collection('users').document(teacher_id).collection('students').document(student_id)
            student_ref.delete()
            
            return True
            
        except Exception as e:
            return False

# Global instance
firebase_service = FirebaseService()
