from fastapi import APIRouter, Request, Response, Path, HTTPException, Depends
from fastapi.responses import RedirectResponse
from typing import Optional, Dict, Any
import time
import uuid
from pydantic import BaseModel
from app.apis.scan_event import ScanEvent, ScanLocation
from app.apis.scan_stats import ScanStats
from app.apis.qr_code import QRCode
from app.apis.firestore_repository import FirestoreRepository
import re
import user_agents
from starlette.background import BackgroundTasks
from app.env import mode, Mode

# Log environment information for debugging
print(f"[TRACK QR] Environment mode: {mode}")

# Initialize repositories
qr_code_repo = FirestoreRepository[QRCode](collection_name="qr_codes", model_class=QRCode)
scan_event_repo = FirestoreRepository[ScanEvent](collection_name="scan_events", model_class=ScanEvent)
scan_stats_repo = FirestoreRepository[ScanStats](collection_name="scan_stats", model_class=ScanStats)

router = APIRouter(prefix="/track", tags=["tracking"])


def get_client_ip(request: Request) -> str:
    """
    Extract the client IP address from the request
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host or ""


def parse_user_agent(user_agent_string: str) -> Dict[str, Any]:
    """
    Parse the user agent string into device type and other details
    """
    try:
        ua = user_agents.parse(user_agent_string)
        
        if ua.is_mobile:
            device_type = "mobile"
        elif ua.is_tablet:
            device_type = "tablet"
        elif ua.is_pc:
            device_type = "desktop"
        else:
            device_type = "unknown"
            
        return {
            "device_type": device_type,
            "browser": ua.browser.family,
            "os": ua.os.family
        }
    except Exception as e:
        print(f"Error parsing user agent: {str(e)}")
        return {"device_type": "unknown"}


def get_qr_code(qr_code_id: str) -> Optional[QRCode]:
    """
    Get a QR code by its ID
    """
    try:
        # Get the QR code from the database
        qr_codes = qr_code_repo.query_by_field("id", qr_code_id)
        
        if not qr_codes:
            print(f"QR code {qr_code_id} not found in database")
            return None
        
        qr_code = qr_codes[0]
        print(f"Successfully retrieved QR code {qr_code_id}")
        return qr_code
        
    except Exception as e:
        print(f"Error retrieving QR code {qr_code_id}: {str(e)}")
        return None


def update_scan_stats(scan_event: ScanEvent):
    """
    Update or create scan statistics for the QR code
    """
    try:
        # First, update scan count on the QR code itself to ensure it increments even if stats fail
        qr_codes = qr_code_repo.query_by_field("id", scan_event.qr_code_id)
        if qr_codes:
            qr_code = qr_codes[0]
            qr_code.scan_count += 1
            
            # Update QR code directly to increment scan count
            qr_code_repo.collection.document(qr_code.id).update({"scan_count": qr_code.scan_count})
            print(f"Updated QR code scan count to {qr_code.scan_count} for QR code {scan_event.qr_code_id}")
        else:
            print(f"QR code not found for ID: {scan_event.qr_code_id}")
            return
        
        # Track scan statistics in the background
        scan_stats_list = scan_stats_repo.query_by_field("qr_code_id", scan_event.qr_code_id)
        
        if scan_stats_list:
            # Update existing stats
            scan_stats = scan_stats_list[0]
            scan_stats.last_scan_timestamp = scan_event.timestamp
            scan_stats.scan_count += 1
            
            # Update country counts
            if scan_event.location and scan_event.location.country:
                country = scan_event.location.country
                if country in scan_stats.country_counts:
                    scan_stats.country_counts[country] += 1
                else:
                    scan_stats.country_counts[country] = 1
            
            # Update device counts
            if scan_event.device_type:
                device = scan_event.device_type
                if device in scan_stats.device_counts:
                    scan_stats.device_counts[device] += 1
                else:
                    scan_stats.device_counts[device] = 1
            
            # Update browser counts
            if scan_event.browser:
                browser = scan_event.browser
                if browser in scan_stats.browser_counts:
                    scan_stats.browser_counts[browser] += 1
                else:
                    scan_stats.browser_counts[browser] = 1
            
            # Save the updated stats
            scan_stats_repo.update(scan_stats.id, scan_stats)
        else:
            # Create new stats record
            scan_stats = ScanStats(
                id=f"stats-{scan_event.qr_code_id}",
                qr_code_id=scan_event.qr_code_id,
                store_hash=scan_event.store_hash,
                first_scan_timestamp=scan_event.timestamp,
                last_scan_timestamp=scan_event.timestamp,
                scan_count=1,
                country_counts={scan_event.location.country: 1} if scan_event.location and scan_event.location.country else {},
                device_counts={scan_event.device_type: 1} if scan_event.device_type else {},
                browser_counts={scan_event.browser: 1} if scan_event.browser else {}
            )
            
            # Add the new stats
            scan_stats_repo.add(scan_stats, document_id=scan_stats.id)
        
        print(f"Successfully updated scan statistics for QR code {scan_event.qr_code_id}")
    except Exception as e:
        print(f"Error updating scan stats: {str(e)}")


@router.get("/{qr_code_id}")
async def track_scan(request: Request, background_tasks: BackgroundTasks, qr_code_id: str = Path(...)):
    """
    Track a QR code scan and redirect to the target URL
    """
    print(f"[TRACK QR] Received tracking request for QR code ID: {qr_code_id}")
    print(f"[TRACK QR] Request headers: {dict(request.headers)}")
    print(f"[TRACK QR] Request URL: {request.url}")
    print(f"[TRACK QR] Request path: {request.url.path}")
    print(f"[TRACK QR] Request query params: {request.query_params}")
    print(f"[TRACK QR] Current environment: {'PRODUCTION' if mode == Mode.PROD else 'DEVELOPMENT'}")
    
    # Lookup the target URL for redirecting
    qr_code = get_qr_code(qr_code_id)
    
    print(f"[TRACK QR] Fetched QR code for ID {qr_code_id}: {qr_code}")
    print(f"[TRACK QR] Target URL: {qr_code.target.url if qr_code and qr_code.target else 'None'}")
    
    if qr_code is None or not qr_code.target or not qr_code.target.url:
        print(f"[TRACK QR] QR code {qr_code_id} has no valid target URL")
        # Instead of returning JSON, redirect to a default error page in both environments
        error_url = "https://app.getrobo.xyz/error/invalid-qr" if mode == Mode.PROD else "https://databutton.com/error/invalid-qr"
        print(f"[TRACK QR] Redirecting to error page: {error_url}")
        return RedirectResponse(url=error_url, status_code=307)
        
    # Get target URL
    target_url = qr_code.target.url
    print(f"[TRACK QR] Will redirect to target URL: {target_url}")
    
    # Check if the QR code is active before redirecting
    if hasattr(qr_code, 'active') and not qr_code.active:
        print(f"[TRACK QR] QR code {qr_code_id} is marked as inactive")
        # Redirect to a proper error page in both environments
        inactive_url = "https://app.getrobo.xyz/error/inactive-qr" if mode == Mode.PROD else "https://databutton.com/error/inactive-qr"
        print(f"[TRACK QR] Redirecting to inactive page: {inactive_url}")
        return RedirectResponse(url=inactive_url, status_code=307)
    
    # Collect scan data
    ip_address = get_client_ip(request)
    user_agent_string = request.headers.get("User-Agent", "")
    referrer = request.headers.get("Referer", None)
    
    # Parse user agent
    ua_info = parse_user_agent(user_agent_string)
    
    # Create scan event
    scan_event = ScanEvent(
        qr_code_id=qr_code_id,
        store_hash=qr_code.store_hash,
        ip_address=ip_address,
        user_agent=user_agent_string,
        referrer=referrer,
        device_type=ua_info["device_type"],
        browser=ua_info.get("browser", "unknown"),
        os=ua_info.get("os", "unknown"),
        session_id=str(uuid.uuid4())  # Generate a unique session ID
    )
    
    print(f"[TRACK QR] User agent parsed: device={scan_event.device_type}, browser={scan_event.browser}, os={scan_event.os}")
    
    # Save scan event in the background to not slow down the redirect
    def save_scan_event_and_update_stats(event):
        try:
            # Set timestamp on the event before serialization
            event.timestamp = int(time.time())
            
            # First add the scan event without using the repository to avoid serialization issues
            scan_event_dict = event.dict()
            
            # Add directly to Firestore collection
            scan_event_id = str(uuid.uuid4())
            scan_event_ref = scan_event_repo.collection.document(scan_event_id)
            scan_event_ref.set(scan_event_dict)
            
            # Log successful event recording
            print(f"[TRACK QR] Successfully recorded scan event {scan_event_id} for QR code {event.qr_code_id}")
            
            # Update scan statistics
            update_scan_stats(event)
            print(f"[TRACK QR] Successfully updated scan statistics for QR code {event.qr_code_id}")
        except Exception as e:
            print(f"[TRACK QR] Error saving scan event: {str(e)}")
    
    # Add task to background
    background_tasks.add_task(save_scan_event_and_update_stats, scan_event)
    
    # Log the scan
    print(
        f"[TRACK QR] QR code scan complete: qr_code_id={qr_code_id}, store_hash={qr_code.store_hash}, redirecting to: {target_url}"
    )
    
    # Redirect to target URL with explicit 307 Temporary Redirect status code
    # Using 307 ensures the redirect maintains the same HTTP method
    print(f"[TRACK QR] Executing final redirect to: {target_url}")
    return RedirectResponse(url=target_url, status_code=307)
