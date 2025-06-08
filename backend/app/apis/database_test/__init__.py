from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.apis.models import Store, StoreAuth, StoreStatus, QRCode, QRCodeTarget, QRCodeStyle
from app.apis.firestore_repository import FirestoreRepository

router = APIRouter(prefix="/db-test")

# Initialize repositories
store_repo = FirestoreRepository[Store](collection_name="stores", model_class=Store)
qr_code_repo = FirestoreRepository[QRCode](collection_name="qr_codes", model_class=QRCode)

# Response Models
class StatusResponse(BaseModel):
    status: str
    message: str

class StoreResponse(BaseModel):
    id: str
    store_hash: str
    store_name: str

@router.get("/ping")
def ping() -> StatusResponse:
    """
    Simple ping endpoint to test database connectivity
    """
    return StatusResponse(
        status="success",
        message="Database API is working"
    )

@router.post("/store")
def create_store(store_hash: str, store_name: str) -> StatusResponse:
    """
    Create a test store in the database
    """
    # Create a simple store object
    store = Store(
        store_hash=store_hash,
        store_name=store_name,
        auth=StoreAuth(
            access_token="test_token",
            context="test_context",
        ),
        status=StoreStatus()
    )
    
    # Save to database
    store_id = store_repo.add(store, document_id=store_hash)
    
    return StatusResponse(
        status="success",
        message=f"Store created with ID: {store_id}"
    )

@router.get("/stores")
def list_test_stores() -> List[StoreResponse]:
    """
    List all stores in the database
    """
    stores = store_repo.list(limit=10)
    return [
        StoreResponse(
            id=store.store_hash,
            store_hash=store.store_hash,
            store_name=store.store_name or "Unnamed Store"
        ) for store in stores
    ]

@router.post("/qr-code")
def create_qr_code(store_hash: str, name: str, url: str) -> StatusResponse:
    """
    Create a test QR code in the database
    """
    # Create QR code object
    qr_code = QRCode(
        store_hash=store_hash,
        name=name,
        type="custom",
        target=QRCodeTarget(url=url),
        style=QRCodeStyle()
    )
    
    # Save to database
    qr_code_id = qr_code_repo.add(qr_code)
    
    return StatusResponse(
        status="success",
        message=f"QR code created with ID: {qr_code_id}"
    )

# Endpoint removed to prevent conflict with qr_code module
