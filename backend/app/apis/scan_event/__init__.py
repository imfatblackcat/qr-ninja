from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import time
import uuid
from fastapi import APIRouter
from app.apis.firestore_repository import FirestoreRepository

router = APIRouter()


class ScanLocation(BaseModel):
    """
    Geographic location information for a QR code scan
    """
    country: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ScanEvent(BaseModel):
    """
    Records a single QR code scan event with detailed information
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    qr_code_id: str
    store_hash: str
    timestamp: int = Field(default_factory=lambda: int(time.time()))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    location: Optional[ScanLocation] = None
    device_type: str = "unknown"  # "mobile", "tablet", "desktop", "unknown"
    browser: str = "unknown"  # Browser name from user agent
    os: str = "unknown"  # Operating system from user agent
    session_id: Optional[str] = None
    conversion: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to a dictionary suitable for Firestore
        """
        return self.dict()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScanEvent':
        """
        Create a ScanEvent instance from a Firestore document
        """
        return cls(**data)

# Initialize the repository
scan_event_repo = FirestoreRepository[ScanEvent](collection_name="scan_events", model_class=ScanEvent)

