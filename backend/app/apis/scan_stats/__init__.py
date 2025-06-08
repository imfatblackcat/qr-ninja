from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import time
from fastapi import APIRouter, HTTPException, Path, Query, Depends
from app.apis.firestore_repository import FirestoreRepository

router = APIRouter(prefix="/scan-stats", tags=["scan_stats"])


class ScanStats(BaseModel):
    """
    Aggregated statistics for QR code scans
    """
    qr_code_id: str  # Primary key
    store_hash: str  # For faster filtering
    total_scans: int = 0
    daily_scans: Dict[str, int] = Field(default_factory=dict)  # "YYYY-MM-DD": count
    device_breakdown: Dict[str, int] = Field(default_factory=dict)  # device_type: count
    location_breakdown: Dict[str, int] = Field(default_factory=dict)  # country_code: count
    conversions: int = 0
    last_updated: int = Field(default_factory=lambda: int(time.time()))
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to a dictionary suitable for Firestore
        """
        return self.dict()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScanStats':
        """
        Create a ScanStats instance from a Firestore document
        """
        return cls(**data)
    
    def update_with_scan(self, scan_event) -> None:
        """
        Update statistics with a new scan event
        
        Args:
            scan_event (ScanEvent): The scan event to add to statistics
        """
        # Increment total scan count
        self.total_scans += 1
        
        # Update timestamp
        self.last_updated = int(time.time())
        
        # Get date string for daily counts
        from datetime import datetime
        date_str = datetime.fromtimestamp(scan_event.timestamp).strftime("%Y-%m-%d")
        
        # Update daily scans
        if date_str in self.daily_scans:
            self.daily_scans[date_str] += 1
        else:
            self.daily_scans[date_str] = 1
        
        # Update device breakdown
        device_type = scan_event.device_type
        if device_type in self.device_breakdown:
            self.device_breakdown[device_type] += 1
        else:
            self.device_breakdown[device_type] = 1
        
        # Update location breakdown if location data exists
        if scan_event.location and scan_event.location.country:
            country = scan_event.location.country
            if country in self.location_breakdown:
                self.location_breakdown[country] += 1
            else:
                self.location_breakdown[country] = 1
        
        # Update conversions if applicable
        if scan_event.conversion:
            self.conversions += 1

# Initialize the repository
scan_stats_repo = FirestoreRepository[ScanStats](collection_name="scan_stats", model_class=ScanStats)

class GetScanStatsResponse(BaseModel):
    stats: ScanStats


class ListScanStatsResponse(BaseModel):
    stats: List[ScanStats]
    count: int


@router.get("/{qr_code_id}", response_model=GetScanStatsResponse)
def get_scan_stats(qr_code_id: str = Path(..., description="The ID of the QR code to get stats for")):
    """
    Get scan statistics for a specific QR code
    """
    # Fetch stats from the database
    stats_list = scan_stats_repo.query_by_field("qr_code_id", qr_code_id)
    
    if not stats_list:
        # Return empty stats if not found
        stats = ScanStats(
            qr_code_id=qr_code_id,
            store_hash="unknown",
            total_scans=0,
            daily_scans={},
            device_breakdown={},
            location_breakdown={},
            conversions=0
        )
    else:
        stats = stats_list[0]
    
    return GetScanStatsResponse(stats=stats)


@router.get("", response_model=ListScanStatsResponse)
def list_scan_stats(
    store_hash: str = Query(..., description="The store hash to filter QR codes by"),
    limit: int = Query(10, description="Maximum number of results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    time_period: Optional[str] = Query(None, description="Time period to filter by (7days, 30days, 90days, year)")
):
    """
    List scan statistics for QR codes in a store
    """
    # Fetch all stats for the store
    all_stats = scan_stats_repo.query_by_field("store_hash", store_hash)
    
    # Filter by time period if specified
    if time_period and all_stats:
        from datetime import datetime, timedelta
        now = datetime.now()
        
        if time_period == "7days":
            cutoff = now - timedelta(days=7)
        elif time_period == "30days":
            cutoff = now - timedelta(days=30)
        elif time_period == "90days":
            cutoff = now - timedelta(days=90)
        elif time_period == "year":
            cutoff = now - timedelta(days=365)
        else:
            cutoff = None
            
        # Filter the daily_scans data to only include dates within the time period
        if cutoff:
            cutoff_str = cutoff.strftime("%Y-%m-%d")
            for stats in all_stats:
                filtered_daily_scans = {}
                for date_str, count in stats.daily_scans.items():
                    if date_str >= cutoff_str:
                        filtered_daily_scans[date_str] = count
                stats.daily_scans = filtered_daily_scans
    
    # Sort by total_scans descending
    sorted_stats = sorted(all_stats, key=lambda x: x.total_scans, reverse=True)
    
    # Apply pagination
    paginated_stats = sorted_stats[offset:offset + limit]
    
    return ListScanStatsResponse(stats=paginated_stats, count=len(sorted_stats))
