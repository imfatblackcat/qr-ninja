from fastapi import APIRouter, Path, HTTPException
from app.apis.qr_code import QRCode, qr_code_repo, QRCodeTarget
from app.apis.firestore_repository import FirestoreRepository
import uuid

router = APIRouter(prefix="/qr-test", tags=["qr-test"])

@router.get("/create-test-qr-code")
async def create_test_qr_code():
    """
    Create a test QR code for testing scanning functionality
    """
    try:
        # Create a test QR code
        test_id = f"test-{uuid.uuid4().hex[:8]}"
        test_store_hash = "test-store"
        
        qr_code = QRCode(
            id=test_id,
            store_hash=test_store_hash,
            name="Test QR Code",
            type="test",
            target=QRCodeTarget(
                # Use a reliable test URL that works in all environments
                url="https://wp.pl"
            )
        )
        
        # Save to database
        qr_code_repo.add(qr_code, document_id=test_id)
        
        return {
            "status": "success",
            "message": "Test QR code created successfully",
            "qr_code_id": test_id,
            "qr_code": qr_code.dict(),
            "tracking_url": f"/track/{test_id}",
            "image_url": f"/qr-image/{test_id}.png"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating test QR code: {str(e)}")
