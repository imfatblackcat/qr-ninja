from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import time
from datetime import datetime, timedelta
from app.apis.firestore_repository import FirestoreRepository
from app.apis.scan_event import ScanEvent
from app.apis.scan_stats import ScanStats
from app.apis.qr_code import QRCode
from collections import defaultdict

# Initialize repositories
scan_event_repo = FirestoreRepository[ScanEvent](collection_name="scan_events", model_class=ScanEvent)
scan_stats_repo = FirestoreRepository[ScanStats](collection_name="scan_stats", model_class=ScanStats)
qr_code_repo = FirestoreRepository[QRCode](collection_name="qr_codes", model_class=QRCode)

router = APIRouter(prefix="/analytics", tags=["analytics"])


class DateSeriesPoint(BaseModel):
    date: str  # YYYY-MM-DD format
    count: int


class QRCodeStat(BaseModel):
    qr_code_id: str
    name: str
    count: int


class AnalyticsOverviewResponse(BaseModel):
    total_scans: int
    avg_daily_scans: float
    top_device: str
    top_location: str
    series: List[DateSeriesPoint]
    top_qr_codes: List[QRCodeStat]
    device_breakdown: Dict[str, int]


def get_date_range(period: str, from_date: Optional[int] = None, to_date: Optional[int] = None):
    """
    Calculate the date range based on the period
    
    Args:
        period: The time period to filter by (7d, 30d, custom)
        from_date: Start timestamp for custom period
        to_date: End timestamp for custom period
        
    Returns:
        Tuple of (start_timestamp, end_timestamp)
    """
    now = datetime.now()
    end_timestamp = int(now.timestamp())
    
    if period == "custom" and from_date is not None and to_date is not None:
        return from_date, to_date
    
    if period == "30d":
        start_date = now - timedelta(days=30)
    else:  # Default to 7d
        start_date = now - timedelta(days=7)
    
    start_timestamp = int(start_date.timestamp())
    return start_timestamp, end_timestamp


def get_analytics_from_scan_events(store_hash: str, start_timestamp: int, end_timestamp: int):
    """
    Generate analytics by aggregating data from scan_events
    
    Args:
        store_hash: The store hash to filter by
        start_timestamp: Start timestamp for the period
        end_timestamp: End timestamp for the period
        
    Returns:
        Dictionary with aggregated analytics data
    """
    print(f"Generating analytics from scan_events for store {store_hash} from {start_timestamp} to {end_timestamp}")
    
    # Query all scan events within the time range for this store
    events = []
    query_results = scan_event_repo.collection.where(
        "store_hash", "==", store_hash
    ).where(
        "timestamp", ">=", start_timestamp
    ).where(
        "timestamp", "<=", end_timestamp
    ).stream()
    
    for doc in query_results:
        event_data = doc.to_dict()
        events.append(ScanEvent(**event_data))
    
    if not events:
        print("No scan events found in the specified period")
        return create_empty_analytics()
    
    # Aggregate data
    total_scans = len(events)
    days_in_period = (end_timestamp - start_timestamp) / (60 * 60 * 24)
    avg_daily_scans = total_scans / days_in_period if days_in_period > 0 else 0
    
    # Count by device type
    device_counts = defaultdict(int)
    for event in events:
        device_counts[event.device_type] += 1
    
    # Find top device
    top_device = max(device_counts.items(), key=lambda x: x[1])[0] if device_counts else "No data"
    
    # Count by location
    location_counts = defaultdict(int)
    for event in events:
        if event.location and event.location.country:
            location_counts[event.location.country] += 1
    
    # Find top location
    top_location = max(location_counts.items(), key=lambda x: x[1])[0] if location_counts else "No data"
    
    # Group events by date
    daily_counts = defaultdict(int)
    for event in events:
        date = datetime.fromtimestamp(event.timestamp).strftime("%Y-%m-%d")
        daily_counts[date] += 1
    
    # Convert to time series
    series = [
        DateSeriesPoint(date=date, count=count)
        for date, count in sorted(daily_counts.items())
    ]
    
    # Count by QR code and get names
    qr_code_counts = defaultdict(int)
    for event in events:
        qr_code_counts[event.qr_code_id] += 1
    
    # Get QR code names
    qr_code_map = {}
    for qr_id in qr_code_counts.keys():
        qr_codes = qr_code_repo.query_by_field("id", qr_id)
        if qr_codes:
            qr_code_map[qr_id] = qr_codes[0].name
        else:
            qr_code_map[qr_id] = f"Unknown QR Code ({qr_id})"
    
    # Create top QR codes list
    top_qr_codes = [
        QRCodeStat(qr_code_id=qr_id, name=qr_code_map.get(qr_id, "Unknown"), count=count)
        for qr_id, count in sorted(qr_code_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return {
        "total_scans": total_scans,
        "avg_daily_scans": round(avg_daily_scans, 1),
        "top_device": top_device,
        "top_location": top_location,
        "series": series,
        "top_qr_codes": top_qr_codes,
        "device_breakdown": dict(device_counts)
    }


def create_empty_analytics():
    """
    Create empty analytics response when no data is available
    """
    return {
        "total_scans": 0,
        "avg_daily_scans": 0,
        "top_device": "No data",
        "top_location": "No data",
        "series": [],
        "top_qr_codes": [],
        "device_breakdown": {}
    }


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    store_hash: str = Query(..., description="The store hash to filter by"),
    period: str = Query("7d", description="Time period to filter by (7d, 30d, custom)"),
    from_timestamp: Optional[int] = Query(None, description="Start timestamp for custom period"),
    to_timestamp: Optional[int] = Query(None, description="End timestamp for custom period")
):
    """
    Get analytics overview for a store within a specified time period
    
    This endpoint aggregates data from scan events to provide a comprehensive analytics overview
    including total scans, average daily scans, top devices, locations, and QR code performance.
    """
    # Calculate date range based on period
    start_timestamp, end_timestamp = get_date_range(period, from_timestamp, to_timestamp)
    
    # Generate analytics from scan events
    analytics = get_analytics_from_scan_events(store_hash, start_timestamp, end_timestamp)
    
    return AnalyticsOverviewResponse(**analytics)


@router.get("/qrcode/{qr_code_id}", response_model=AnalyticsOverviewResponse)
def get_qr_code_analytics(
    qr_code_id: str = Path(..., description="The QR code ID to get analytics for"),
    period: str = Query("7d", description="Time period to filter by (7d, 30d, custom)"),
    from_timestamp: Optional[int] = Query(None, description="Start timestamp for custom period"),
    to_timestamp: Optional[int] = Query(None, description="End timestamp for custom period")
):
    """
    Get detailed analytics for a specific QR code
    
    This endpoint provides analytics specific to a single QR code, including scan count trends,
    device breakdowns, and location data.
    """
    # First get the QR code to validate it exists and get the store_hash
    qr_codes = qr_code_repo.query_by_field("id", qr_code_id)
    if not qr_codes:
        raise HTTPException(status_code=404, detail=f"QR code with ID {qr_code_id} not found")
    
    qr_code = qr_codes[0]
    store_hash = qr_code.store_hash
    
    # Calculate date range based on period
    start_timestamp, end_timestamp = get_date_range(period, from_timestamp, to_timestamp)
    
    # Query all scan events for this QR code within the time range
    events = []
    query_results = scan_event_repo.collection.where(
        "qr_code_id", "==", qr_code_id
    ).where(
        "timestamp", ">=", start_timestamp
    ).where(
        "timestamp", "<=", end_timestamp
    ).stream()
    
    for doc in query_results:
        event_data = doc.to_dict()
        events.append(ScanEvent(**event_data))
    
    if not events:
        print(f"No scan events found for QR code {qr_code_id} in the specified period")
        empty_response = create_empty_analytics()
        empty_response["top_qr_codes"] = [QRCodeStat(qr_code_id=qr_code_id, name=qr_code.name, count=0)]
        return AnalyticsOverviewResponse(**empty_response)
    
    # Aggregate data
    total_scans = len(events)
    days_in_period = (end_timestamp - start_timestamp) / (60 * 60 * 24)
    avg_daily_scans = total_scans / days_in_period if days_in_period > 0 else 0
    
    # Count by device type
    device_counts = defaultdict(int)
    for event in events:
        device_counts[event.device_type] += 1
    
    # Find top device
    top_device = max(device_counts.items(), key=lambda x: x[1])[0] if device_counts else "No data"
    
    # Count by location
    location_counts = defaultdict(int)
    for event in events:
        if event.location and event.location.country:
            location_counts[event.location.country] += 1
    
    # Find top location
    top_location = max(location_counts.items(), key=lambda x: x[1])[0] if location_counts else "No data"
    
    # Group events by date
    daily_counts = defaultdict(int)
    for event in events:
        date = datetime.fromtimestamp(event.timestamp).strftime("%Y-%m-%d")
        daily_counts[date] += 1
    
    # Convert to time series
    series = [
        DateSeriesPoint(date=date, count=count)
        for date, count in sorted(daily_counts.items())
    ]
    
    return AnalyticsOverviewResponse(
        total_scans=total_scans,
        avg_daily_scans=round(avg_daily_scans, 1),
        top_device=top_device,
        top_location=top_location,
        series=series,
        top_qr_codes=[QRCodeStat(qr_code_id=qr_code_id, name=qr_code.name, count=total_scans)],
        device_breakdown=dict(device_counts)
    )
