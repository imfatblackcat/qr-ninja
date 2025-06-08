from fastapi import APIRouter, BackgroundTasks
from app.apis.qr_code import QRCode, QRCodeTarget, QRCodeStyle
from app.apis.scan_event import ScanEvent
from app.apis.firestore_repository import FirestoreRepository
from app.apis.scan_proxy import update_scan_stats
import time
import random
import uuid

# Initialize repositories
qr_code_repo = FirestoreRepository[QRCode](collection_name="qr_codes", model_class=QRCode)
scan_event_repo = FirestoreRepository[ScanEvent](collection_name="scan_events", model_class=ScanEvent)

router = APIRouter(prefix="/load-test-tracking", tags=["load-test-tracking"])

def create_test_qr_code(store_hash):
    """Create a test QR code"""
    qr_code = QRCode(
        id=f"test-{uuid.uuid4().hex[:8]}",
        store_hash=store_hash,
        name="Test QR Code",
        type="test",
        target=QRCodeTarget(
            url="https://www.example.com/test"
        ),
        style=QRCodeStyle()
    )
    
    # Save the QR code to the database
    qr_code_repo.add(qr_code, document_id=qr_code.id)
    return qr_code

def generate_test_scans(qr_code, num_scans=10):
    """Generate test scan events for a QR code"""
    device_types = ["mobile", "tablet", "desktop"]
    countries = ["US", "UK", "CA", "DE", "FR"]
    
    start_time = int(time.time()) - (86400 * 7)  # 7 days ago
    end_time = int(time.time())
    num_scans_created = 0
    
    for i in range(num_scans):
        # Generate a random timestamp within the last 7 days
        timestamp = random.randint(start_time, end_time)
        
        # Create scan event
        scan_event = ScanEvent(
            qr_code_id=qr_code.id,
            store_hash=qr_code.store_hash,
            timestamp=timestamp,
            device_type=random.choice(device_types),
            country=random.choice(countries),
            user_agent="Test User Agent"
        )
        
        # Save scan event
        scan_event_repo.add(scan_event)
        num_scans_created += 1
        
        # Update scan stats
        update_scan_stats(scan_event)
    
    return num_scans_created

def load_test_data(store_hash, num_qr_codes=3, scans_per_qr=10):
    """Generate test QR codes and scan data"""
    total_qr_codes = 0
    total_scans = 0
    
    for i in range(num_qr_codes):
        # Create a test QR code
        qr_code = create_test_qr_code(store_hash)
        total_qr_codes += 1
        
        # Generate scan events
        scans = generate_test_scans(qr_code, scans_per_qr)
        total_scans += scans
    
    return {
        "qr_codes_created": total_qr_codes,
        "scans_created": total_scans
    }

@router.post("/generate")
def generate_test_data(store_hash: str, num_qr_codes: int = 3, scans_per_qr: int = 10):
    """Generate test QR codes and scan data for a store"""
    result = load_test_data(store_hash, num_qr_codes, scans_per_qr)
    return result
