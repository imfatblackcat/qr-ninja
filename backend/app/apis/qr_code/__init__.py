from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List, Literal
import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Path, Query, Body, Request
from app.apis.store_manager import get_store_data
from app.apis.firestore_repository import FirestoreRepository
from app.env import Mode, mode
from google.cloud.firestore_v1.base_query import FieldFilter
import json

# Set the base URL for the API based on the environment
API_BASE_URL = "https://app.getrobo.xyz/api" if mode == Mode.PROD else "https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes"

# QR code tracking path depends on environment
TRACK_PATH = "/api/track" if mode == Mode.PROD else "/track"

# Function to get the absolute URL for QR code scanning based on the environment
def get_absolute_scan_url(qr_code_id: str) -> str:
    """Get the absolute URL for QR code scanning"""
    if mode == Mode.PROD:
        # In production environment, we use the app.getrobo.xyz domain with /api prefix for tracking
        return f"https://app.getrobo.xyz{TRACK_PATH}/{qr_code_id}"
    else:
        # In development, use the full path to the API endpoint
        return f"https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes{TRACK_PATH}/{qr_code_id}"


router = APIRouter(prefix="/qr-code")


class QRCodeTarget(BaseModel):
    """
    Target information for a QR code (where it points to)
    """
    url: str
    product_id: Optional[int] = None  # For product-specific QR codes
    category_id: Optional[int] = None  # For category-specific QR codes
    coupon_code: Optional[str] = None  # For coupon-specific QR codes
    add_to_cart: bool = False  # Whether this QR code should add a product to cart

    def get_tracking_url(self, qr_code_id: str) -> str:
        """Get the tracking URL for this target"""
        return get_absolute_scan_url(qr_code_id)

class QRCodeStyle(BaseModel):
    """
    Visual styling information for a QR code
    """
    foreground_color: str = "#000000"
    background_color: str = "#FFFFFF"
    logo_url: Optional[str] = None
    dots_style: str = "square"  # "square", "rounded", "dots"
    corner_style: str = "square"  # "square", "rounded", "dots"
    corner_color: Optional[str] = None  # Optional separate color for corners
    logo_size: float = 0.3  # as percentage of QR code size

class QRCode(BaseModel):
    """
    QR code information including style, target, and metadata
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_hash: str
    name: str
    type: str  # "product", "category", "homepage", "cart", "coupon", "custom"
    target: QRCodeTarget
    style: QRCodeStyle = Field(default_factory=QRCodeStyle)
    campaign_id: Optional[str] = None
    created_at: int = Field(default_factory=lambda: int(time.time()))
    updated_at: int = Field(default_factory=lambda: int(time.time()))
    created_by: Optional[str] = None
    scan_count: int = 0
    active: bool = True
    status: str = "active"  # "active", "inactive", "deleted"

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to a dictionary suitable for Firestore
        """
        return self.dict()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'QRCode':
        """
        Create a QRCode instance from a Firestore document
        """
        return cls(**data)


# Initialize the repository
qr_code_repo = FirestoreRepository[QRCode](collection_name="qr_codes", model_class=QRCode)

# List endpoint for QR codes
@router.get("/list/{store_hash}") # Maps to /qr-code/list/{store_hash}
async def list_qr_codes(store_hash: str, limit: int = 100, offset: int = 0):
    """
    List all QR codes for a specific store
    """
    try:
        # Query QR codes by store hash
        qr_codes = qr_code_repo.query_by_field("store_hash", store_hash)
        
        # Filter out QR codes with status 'deleted' OR active=False
        filtered_qr_codes = [qr for qr in qr_codes if qr.status != "deleted" and qr.active]
        
        print(f"[LIST QR] Found {len(qr_codes)} total QR codes, {len(filtered_qr_codes)} active codes after filtering")
        
        # Return formatted results
        return {
            "qr_codes": [
                {
                    "id": qr.id,
                    "name": qr.name,
                    "type": qr.type,
                    "url": qr.target.url,
                    "created_at": qr.created_at,
                    "scan_count": qr.scan_count,
                    "active": qr.active,
                    "status": qr.status
                } for qr in filtered_qr_codes
            ],
            "total": len(filtered_qr_codes),
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing QR codes: {str(e)}"
        )

# Request models for QR code generation
class ProductQRCodeRequest(BaseModel):
    store_hash: str
    name: str
    product_id: int
    add_to_cart: bool = False
    style: Optional[QRCodeStyle] = None
    campaign_id: Optional[str] = None

class CategoryQRCodeRequest(BaseModel):
    store_hash: str
    name: str
    category_id: int
    style: Optional[QRCodeStyle] = None
    campaign_id: Optional[str] = None

class HomepageQRCodeRequest(BaseModel):
    store_hash: str
    name: str
    style: Optional[QRCodeStyle] = None
    campaign_id: Optional[str] = None

class CustomURLQRCodeRequest(BaseModel):
    store_hash: str
    name: str
    target: QRCodeTarget
    style: Optional[QRCodeStyle] = None
    campaign_id: Optional[str] = None

class QRCodeResponse(BaseModel):
    id: str
    qr_code: QRCode
    status: str = "success"

class UpdateQRCodeRequest(BaseModel):
    name: Optional[str] = None
    style: Optional[QRCodeStyle] = None
    active: Optional[bool] = None
    campaign_id: Optional[str] = None

class StatusResponse(BaseModel):
    status: str = "success"
    message: str
    qr_code_id: Optional[str] = None


@router.post("/product", response_model=QRCodeResponse)
async def create_product_qr_code(request: ProductQRCodeRequest):
    """
    Create a QR code for a specific product
    """
    try:
        # Get store data to verify the store exists
        store = get_store_data(request.store_hash)

        # Print store information for debugging
        print(f"Store data: {store}")

        # Construct the target URL from domain or create from store hash
        store_url = None

        # First check if store is a dict-like object or StoreData object
        if isinstance(store, dict):
            # Dict-like object
            if store.get('domain'):
                store_url = f"https://{store['domain']}"
            elif store.get('store_url'):
                store_url = store['store_url']
        else:
            # StoreData object
            if hasattr(store, 'domain') and store.domain:
                store_url = f"https://{store.domain}"
            elif hasattr(store, 'store_url') and store.store_url:
                store_url = store.store_url

        # If no URL found yet, fallback to BigCommerce standard URL format
        if not store_url:
            store_hash = getattr(store, 'store_hash', request.store_hash)
            store_url = f"https://store-{store_hash}.mybigcommerce.com"

        print(f"Using store URL: {store_url}")

        if not store_url:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Store URL not found")

        # For add to cart QR codes, we'll create a direct add-to-cart URL
        # Otherwise, we'll link to the product page
        if request.add_to_cart:
            target_url = f"{store_url}/cart.php?action=add&product_id={request.product_id}"
            qr_type = "cart"
        else:
            target_url = f"{store_url}/products.php?product_id={request.product_id}"
            qr_type = "product"

        # Create QR code object
        qr_code = QRCode(
            store_hash=request.store_hash,
            name=request.name,
            type=qr_type,
            target=QRCodeTarget(
                url=target_url,
                product_id=request.product_id,
                add_to_cart=request.add_to_cart
            ),
            style=request.style or QRCodeStyle(),
            campaign_id=request.campaign_id
        )

        # Save the QR code to the database
        qr_code_id = qr_code_repo.add(qr_code, document_id=qr_code.id)

        return QRCodeResponse(
            id=qr_code_id,
            qr_code=qr_code,
            status="success"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product QR code: {str(e)}"
        )

@router.post("/category", response_model=QRCodeResponse)
async def create_category_qr_code(request: CategoryQRCodeRequest):
    """
    Create a QR code for a specific category
    """
    try:
        # Get store data to verify the store exists
        store = get_store_data(request.store_hash)

        # Construct the target URL
        store_url = store.store_url
        if not store_url:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Store URL not found")

        target_url = f"{store_url}/categories.php?category_id={request.category_id}"

        # Create QR code object
        qr_code = QRCode(
            store_hash=request.store_hash,
            name=request.name,
            type="category",
            target=QRCodeTarget(
                url=target_url,
                category_id=request.category_id
            ),
            style=request.style or QRCodeStyle(),
            campaign_id=request.campaign_id
        )

        # Save the QR code to the database
        qr_code_id = qr_code_repo.add(qr_code, document_id=qr_code.id)

        return QRCodeResponse(
            id=qr_code_id,
            qr_code=qr_code,
            status="success"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating category QR code: {str(e)}"
        )

@router.post("/homepage", response_model=QRCodeResponse)
async def create_homepage_qr_code(request: HomepageQRCodeRequest):
    """
    Create a QR code for the store homepage
    """
    try:
        # Get store data to verify the store exists
        store = get_store_data(request.store_hash)

        # Construct the target URL
        store_url = store.store_url
        if not store_url:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Store URL not found")

        # Create QR code object
        qr_code = QRCode(
            store_hash=request.store_hash,
            name=request.name,
            type="homepage",
            target=QRCodeTarget(
                url=store_url
            ),
            style=request.style or QRCodeStyle(),
            campaign_id=request.campaign_id
        )

        # Save the QR code to the database
        qr_code_id = qr_code_repo.add(qr_code, document_id=qr_code.id)

        return QRCodeResponse(
            id=qr_code_id,
            qr_code=qr_code,
            status="success"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating homepage QR code: {str(e)}"
        )

@router.put("/{qr_code_id}", response_model=QRCodeResponse)
async def update_qr_code(qr_code_id: str = Path(..., description="The ID of the QR code to update"), request: UpdateQRCodeRequest = None):
    """
    Update an existing QR code's properties
    """
    try:
        # Get the existing QR code
        qr_codes = qr_code_repo.query_by_field("id", qr_code_id)
        if not qr_codes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"QR code with ID {qr_code_id} not found"
            )

        qr_code = qr_codes[0]

        # Update fields if provided
        if request.name is not None:
            qr_code.name = request.name

        if request.style is not None:
            qr_code.style = request.style

        if request.active is not None:
            qr_code.active = request.active

        if request.campaign_id is not None:
            qr_code.campaign_id = request.campaign_id

        # Update the timestamp
        qr_code.updated_at = int(time.time())

        # Save the updated QR code
        qr_code_repo.update(qr_code.id, qr_code)

        return QRCodeResponse(
            id=qr_code.id,
            qr_code=qr_code,
            status="success"
        )

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating QR code: {str(e)}"
        )

@router.delete("/{qr_code_id}", status_code=204)
async def delete_qr_code(qr_code_id: str = Path(..., description="The ID of the QR code to delete"), hard_delete: bool = False):
    """
    Perform soft-delete on a QR code by setting active=False and status="deleted"
    """
    try:
        print(f"[DELETE QR] Received request to delete QR code with ID: {qr_code_id}, hard_delete={hard_delete}")
        
        # First try to find the QR code by its ID field
        print(f"[DELETE QR] Querying for QR code with field 'id'={qr_code_id}")
        qr_codes = qr_code_repo.query_by_field("id", qr_code_id)
        
        if not qr_codes:
            # Try a brute-force approach if the query_by_field doesn't work (might be an indexing issue)
            print(f"[DELETE QR] Could not find QR code via query_by_field, trying collection scan")
            
            # Scan all documents in the collection (not efficient, but guaranteed to find it if it exists)
            docs = list(qr_code_repo.collection.stream())
            matching_docs = [doc for doc in docs if doc.to_dict().get('id') == qr_code_id]
            
            if matching_docs:
                firestore_doc_id = matching_docs[0].id
                qr_code_data = matching_docs[0].to_dict()
                qr_code = QRCode(**qr_code_data)
                print(f"[DELETE QR] Found QR code via collection scan, Firestore ID: {firestore_doc_id}")
            else:
                print(f"[DELETE QR] QR code with ID {qr_code_id} not found after collection scan")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"QR code with ID {qr_code_id} not found"
                )
        else:
            print(f"[DELETE QR] Found QR code with ID: {qr_code_id} using ID field query")
            qr_code = qr_codes[0]
            
            # Get the Firestore document ID
            doc_query = qr_code_repo.collection.where(filter=FieldFilter("id", "==", qr_code_id))
            docs = list(doc_query.stream())
            
            if docs:
                firestore_doc_id = docs[0].id
                print(f"[DELETE QR] Found Firestore document ID: {firestore_doc_id} for QR code ID: {qr_code_id}")
            else:
                # If we found the model but not the document, it's a data inconsistency
                print(f"[DELETE QR] WARNING: Found QR code model but couldn't find Firestore document")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"QR code document with ID {qr_code_id} not found"
                )
        
        # Always mark QR code as inactive
        qr_code.active = False
        
        # Update the timestamp
        qr_code.updated_at = int(time.time())
        
        # Set appropriate status based on deletion type
        if hard_delete:
            # Set status to 'deleted' for hard delete (still soft in database terms)
            print(f"[DELETE QR] Setting QR code status to 'deleted' for ID: {qr_code_id}")
            qr_code.status = "deleted"
        else:
            # Soft delete - mark as inactive
            print(f"[DELETE QR] Setting QR code status to 'inactive' for ID: {qr_code_id}")
            qr_code.status = "inactive"
        
        # Update the document in Firestore (NEVER delete!)
        update_result = qr_code_repo.update(firestore_doc_id, qr_code)
        print(f"[DELETE QR] Update result: {update_result}")
        
        # Verify the update by trying to fetch the QR code again
        verify_query = qr_code_repo.collection.where(filter=FieldFilter("id", "==", qr_code_id))
        verify_docs = list(verify_query.stream())
        
        if verify_docs:
            updated_doc = verify_docs[0].to_dict()
            updated_status = updated_doc.get('status', 'active')
            updated_active = updated_doc.get('active', True)
            print(f"[DELETE QR] Verification check - QR code status={updated_status}, active={updated_active}")
            
            if updated_active:
                print(f"[DELETE QR] WARNING: QR code active flag was not properly updated!")
                
            if hard_delete and updated_status != "deleted":
                print(f"[DELETE QR] WARNING: QR code was not properly marked as deleted! Status: {updated_status}")
            elif not hard_delete and updated_status != "inactive":
                print(f"[DELETE QR] WARNING: QR code was not properly marked as inactive! Status: {updated_status}")
        else:
            print(f"[DELETE QR] WARNING: Could not verify QR code status after update!")
        
        # Return 204 No Content status code without a response body
        return None
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting QR code: {str(e)}"
        )

@router.post("/custom", response_model=QRCodeResponse)
async def create_custom_url_qr_code(request: CustomURLQRCodeRequest):
    """
    Create a QR code for a custom URL
    """
    try:
        # Get store data to verify the store exists
        store = get_store_data(request.store_hash)

        # Create QR code object
        qr_code = QRCode(
            store_hash=request.store_hash,
            name=request.name,
            type="custom",
            target=request.target,
            style=request.style or QRCodeStyle(),
            campaign_id=request.campaign_id
        )

        # Save the QR code to the database
        qr_code_id = qr_code_repo.add(qr_code, document_id=qr_code.id)

        return QRCodeResponse(
            id=qr_code_id,
            qr_code=qr_code,
            status="success"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating custom URL QR code: {str(e)}"
        )

@router.post("/create-test-qr-code", response_model=StatusResponse)
async def create_test_qr_code2(request: Request = None):
    """
    Create a test QR code for testing scanning functionality
    """
    try:
        # Extract target URL from query parameter if provided
        target_url = "https://wp.pl"  # Default fallback URL
        if request and request.query_params:
            if "url" in request.query_params:
                target_url = request.query_params["url"]
                print(f"[TEST QR] Using provided target URL: {target_url}")
        else:
            print(f"[TEST QR] No URL provided, using default: {target_url}")
        
        # Create a test QR code with a predictable ID
        test_id = f"test-{uuid.uuid4().hex[:8]}"
        test_store_hash = "test-store"
        print(f"[TEST QR] Creating test QR code with ID: {test_id} and target URL: {target_url}")

        # Create QR code object
        qr_code = QRCode(
            id=test_id,
            store_hash=test_store_hash,
            name="Test QR Code",
            type="test",
            target=QRCodeTarget(
                # Use the specified URL or fallback to default
                url=target_url
            ),
            style=QRCodeStyle()
        )

        # Save the QR code to the database
        qr_code_repo.add(qr_code, document_id=qr_code.id)

        return StatusResponse(
            status="success",
            message="Test QR code created successfully",
            qr_code_id=test_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating test QR code: {str(e)}"
        )
