import firebase_admin
from firebase_admin import credentials, firestore
import json
import databutton as db
from fastapi import APIRouter
from app.env import Mode, mode

"""
Firebase Client Module for Hello Commerce BigCommerce App

This module provides Firestore database access for the application.

=== FIREBASE CONFIGURATION GUIDE ===

To properly configure Firebase for this application:

1. Create a Firebase Project:
   - Go to the Firebase Console (https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Firestore Database if not already enabled

2. Generate Service Account Key:
   - In your Firebase project, go to Project Settings (gear icon) > Service Accounts
   - Click "Generate new private key" button
   - Save the downloaded JSON file securely

3. Add to Databutton Secrets:
   - Go to the Databutton dashboard
   - Navigate to your app > Settings > Secrets
   - Add a new secret with key `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Paste the entire JSON content from the service account key file

Behavior by Environment:
- Development Mode: If key missing, uses mock client for testing
- Production Mode: If key missing, application will fail to start
"""

# Create an empty router to satisfy Databutton API module requirements
# This is a utility module, not an API endpoint module
router = APIRouter()

# Firebase client singleton
_app = None
_db = None

def get_firestore_db():
    """
    Get a Firestore client instance, initializing it if necessary.
    
    In development mode, if the Firebase service account key is not found,
    a mock Firestore client will be returned to allow the application to start.
    
    In production mode, a missing key will still raise an exception.
    """
    global _app, _db
    
    if _db is None:
        try:
            # Get the Firebase service account key from secrets
            firebase_service_account_key = db.secrets.get("FIREBASE_SERVICE_ACCOUNT_KEY")
            
            if not firebase_service_account_key:
                # Different behavior based on environment
                if mode != Mode.PROD:
                    # In development, provide a mock client
                    print("WARNING: Firebase service account key not found in secrets. Using mock client in development mode.")
                    print("To add the service account key, follow these steps:")
                    print("1. Go to Firebase Console > Project Settings > Service Accounts")
                    print("2. Generate a new private key (JSON file)")
                    print("3. Add the contents of the JSON file to Databutton Secrets as FIREBASE_SERVICE_ACCOUNT_KEY")
                    
                    # Create a mock Firestore client
                    try:
                        # Try to create a client with a mock project
                        # This will work for basic operations but won't actually save data
                        _app = firebase_admin.initialize_app(name="mock_app", options={"projectId": "mock-local-project"})
                        _db = firestore.client()
                        print("Mock Firebase client initialized for development")
                        return _db
                    except Exception as mock_err:
                        # If we can't create a mock client, create a proper in-memory mock
                        print(f"Could not create Firebase mock client: {str(mock_err)}")
                        try:
                            from app.apis.in_memory_firestore import InMemoryFirestore
                            _db = InMemoryFirestore()
                            print("In-memory Firestore simulator initialized for development")
                        except Exception as in_mem_err:
                            print(f"Failed to initialize in-memory Firestore: {str(in_mem_err)}")
                            # Last resort - basic MagicMock
                            from unittest.mock import MagicMock
                            _db = MagicMock()
                            # Mock the collection method to return a mock collection
                            _db.collection = lambda collection_name: MagicMock()
                            print("Basic mock Firebase client initialized - may not work for all operations")
                        return _db
                else:
                    # In production, this is a critical error
                    error_msg = """
                    ERROR: Firebase service account key not found in secrets and application is running in PRODUCTION mode.
                    The application cannot start without this configuration.
                    
                    To add the service account key:
                    1. Go to Firebase Console > Project Settings > Service Accounts
                    2. Generate a new private key (JSON file)
                    3. Add the contents of the JSON file to Databutton Secrets as FIREBASE_SERVICE_ACCOUNT_KEY
                    """
                    print(error_msg)
                    raise ValueError("Firebase service account key not found in secrets")
            
            # Parse the JSON string into a dictionary
            cred_dict = json.loads(firebase_service_account_key)
            
            # Initialize Firebase app with the credentials
            cred = credentials.Certificate(cred_dict)
            _app = firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            _db = firestore.client()
            print("Firebase initialized successfully")
        except Exception as e:
            print(f"Error initializing Firebase: {str(e)}")
            if mode == Mode.PROD:
                # In production, re-raise the exception to prevent app from starting with invalid configuration
                raise
            else:
                # In development, provide a proper in-memory mock client as a fallback
                print("WARNING: Falling back to in-memory Firestore simulator for development")
                try:
                    from app.apis.in_memory_firestore import InMemoryFirestore
                    _db = InMemoryFirestore()
                    print("In-memory Firestore simulator initialized for development")
                except Exception as in_mem_err:
                    print(f"Failed to initialize in-memory Firestore: {str(in_mem_err)}")
                    # Last resort - basic MagicMock
                    from unittest.mock import MagicMock
                    _db = MagicMock()
                    # Mock the collection method to return a mock collection
                    _db.collection = lambda collection_name: MagicMock()
                    print("Basic mock Firebase client initialized - may not work for all operations")
    
    return _db
