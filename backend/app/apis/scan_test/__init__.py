from fastapi import APIRouter, HTTPException, Request, Query, Path, BackgroundTasks
from app.apis.qr_code import QRCode, qr_code_repo, QRCodeTarget, QRCodeStyle, get_absolute_scan_url
from app.apis.scan_event import ScanEvent, scan_event_repo
from app.apis.scan_stats import ScanStats, scan_stats_repo
from app.apis.firestore_repository import FirestoreRepository
from pydantic import BaseModel
import uuid
from app.env import Mode, mode
import time
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
import asyncio
import requests
import aiohttp

router = APIRouter(prefix="/scan-test", tags=["scan-test"])

class TestQRResponse(BaseModel):
    qr_code_id: str
    message: str
    tracking_url: str
    image_url: str
    qr_data: dict

@router.get("/create-test-qr")
async def create_scan_test_qr_code22():
    """
    Create a test QR code for testing scanning functionality
    """
    try:
        # Create a test QR code with a predictable ID
        test_id = f"test-{uuid.uuid4().hex[:8]}"
        test_store_hash = "test-store"
        
        # Create QR code object
        qr_code = QRCode(
            id=test_id,
            store_hash=test_store_hash,
            name="Test QR Code",
            type="test",
            target=QRCodeTarget(
                # Use a reliable test URL that works in all environments - avoid internal app URLs
                url="https://wp.pl"
            ),
            style=QRCodeStyle()
        )
        
        # Save the QR code to the database
        qr_code_repo.add(qr_code, document_id=test_id)
        
        # Generate URLs for testing with consistent URL generation
        tracking_url = get_absolute_scan_url(test_id)
        # Need to still define API_BASE_URL for image URL
        API_BASE_URL = "https://app.getrobo.xyz" if mode == Mode.PROD else "https://api.databutton.com"
        image_url = f"{API_BASE_URL}/qr-image/{test_id}.png"
        
        # Log the URLs for debugging
        print(f"[SCAN TEST] Generated tracking URL: {tracking_url}")
        print(f"[SCAN TEST] Generated image URL: {image_url}")
        
        return TestQRResponse(
            qr_code_id=test_id,
            message="Test QR code created successfully",
            tracking_url=tracking_url,
            image_url=image_url,
            qr_data=qr_code.dict()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating test QR code: {str(e)}")


class LoadTestResultItem(BaseModel):
    request_id: str
    success: bool
    duration_ms: float
    timestamp: int


class LoadTestResults(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time_ms: float
    min_response_time_ms: float
    max_response_time_ms: float
    requests_per_second: float
    details: list[LoadTestResultItem]


@router.get("/load-test")
async def load_test_performance(
    qr_code_id: str = None,
    request_count: int = 100,
    concurrent: bool = True,
    background_tasks: BackgroundTasks = None
):
    """
    Test the performance of the tracking endpoint under load
    
    Args:
        qr_code_id: ID of an existing QR code or None to create a new test code
        request_count: Number of requests to simulate
        concurrent: Whether to make requests concurrently (True) or sequentially (False)
    """
    try:
        import aiohttp
        import asyncio
        from statistics import mean
        
        # Create a test QR code if not provided
        if not qr_code_id:
            # Create a test QR code
            test_qr_response = await create_scan_test_qr_code22()
            qr_code_id = test_qr_response.qr_code_id
        
        # Get tracking URL using the consistent function
        tracking_url = get_absolute_scan_url(qr_code_id)
        
        # Results storage
        results = []
        start_time = time.time()
        
        # Function to make a single request and measure response time
        async def make_request(request_id: str, session):
            req_start = time.time()
            success = False
            
            try:
                # Use aiohttp to make a request but don't follow redirects
                async with session.get(tracking_url, allow_redirects=False) as response:
                    success = 300 <= response.status < 400  # Check for redirect status codes
            except Exception as e:
                success = False
            
            duration_ms = (time.time() - req_start) * 1000
            
            return LoadTestResultItem(
                request_id=request_id,
                success=success,
                duration_ms=duration_ms,
                timestamp=int(time.time())
            )
        
        # Execute requests based on the concurrent parameter
        async def run_load_test():
            async with aiohttp.ClientSession() as session:
                if concurrent:
                    # Execute all requests concurrently
                    tasks = []
                    for i in range(request_count):
                        task = asyncio.create_task(
                            make_request(f"req-{i}", session)
                        )
                        tasks.append(task)
                    
                    # Wait for all requests to complete
                    results.extend(await asyncio.gather(*tasks))
                else:
                    # Execute requests sequentially
                    for i in range(request_count):
                        result = await make_request(f"req-{i}", session)
                        results.append(result)
        
        # Run the load test
        asyncio.create_task(run_load_test())
        
        # Function to process results and return a summary
        def process_results():
            successful = [r for r in results if r.success]
            failed = [r for r in results if not r.success]
            
            # Calculate statistics
            durations = [r.duration_ms for r in results]
            total_duration = time.time() - start_time
            
            return LoadTestResults(
                total_requests=len(results),
                successful_requests=len(successful),
                failed_requests=len(failed),
                avg_response_time_ms=mean(durations) if durations else 0,
                min_response_time_ms=min(durations) if durations else 0,
                max_response_time_ms=max(durations) if durations else 0,
                requests_per_second=len(results) / total_duration if total_duration > 0 else 0,
                details=results
            )
        
        # For immediate response, return a message and process in background
        if background_tasks:
            background_tasks.add_task(process_results)
            return JSONResponse({
                "message": f"Load test started with {request_count} requests",
                "qr_code_id": qr_code_id,
                "tracking_url": tracking_url
            })
        else:
            # For smaller tests, wait for completion
            await asyncio.sleep(2)  # Give time for the task to complete
            return process_results()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing load test: {str(e)}")
