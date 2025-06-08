from fastapi import APIRouter

router = APIRouter()

# Repositories for data access
from app.apis.firestore_repository import FirestoreRepository
