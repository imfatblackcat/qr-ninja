from fastapi import APIRouter

router = APIRouter()

# Import all models for easier access
from app.apis.store import Store, StoreAuth, StoreStatus
from app.apis.qr_code import QRCode, QRCodeTarget, QRCodeStyle
from app.apis.scan_event import ScanEvent, ScanLocation
from app.apis.scan_stats import ScanStats
from app.apis.campaign import Campaign
from app.apis.user import User, UserPreferences
