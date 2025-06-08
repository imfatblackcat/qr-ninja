from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import uuid
from typing import Dict, Any, Optional
from app.apis.qr_code import get_absolute_scan_url, TRACK_PATH
from app.env import Mode, mode
import time

router = APIRouter(prefix="/qr-redirect-test")

@router.get("/config")
async def get_redirect_configuration():
    """Get current configuration for QR code redirections"""
    test_id = "test-qr-path"
    tracking_url = get_absolute_scan_url(test_id)
    
    # Split the URL to analyze its components
    url_components = {
        "full_url": tracking_url,
        "track_path": TRACK_PATH,
        "mode": str(mode),
        "is_production": mode == Mode.PROD,
        "qr_code_id": test_id,
        "components": {
            "scheme": tracking_url.split("://")[0] if "://" in tracking_url else None,
            "domain": tracking_url.split("://")[1].split("/")[0] if "://" in tracking_url else None,
            "path": "/" + "/".join(tracking_url.split("://")[1].split("/")[1:]) if "://" in tracking_url else None,
        },
        "timestamp": int(time.time())
    }
    
    # Add diagnostic information for easier debugging
    url_components["diagnosis"] = {
        "production_url_format": f"https://app.getrobo.xyz{TRACK_PATH}/{test_id}",
        "development_url_format": f"https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes{TRACK_PATH}/{test_id}"
    }
    
    return url_components

@router.get("/test-scenarios", operation_id="get_redirect_test_scenarios")
async def test_redirect_scenarios():
    """Return a list of test scenarios for redirects"""
    return {
        "scenarios": [
            {
                "name": "Production tracking URL",
                "url": f"https://app.getrobo.xyz/api/track/test-id",
                "expected": "successful redirect to target URL"
            },
            {
                "name": "Development tracking URL",
                "url": f"https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes/track/test-id",
                "expected": "successful redirect to target URL"
            },
            {
                "name": "Test different path variations", 
                "variations": [
                    "/api/track/test-id", 
                    "/track/test-id"
                ]
            }
        ]
    }

@router.get("/test-redirect/{scenario}", operation_id="test_specific_redirect_scenario")
async def test_redirect_scenario(scenario: str, request: Request):
    """Test a specific redirect scenario"""
    
    # Create a unique QR code ID for this test
    test_id = f"test-{uuid.uuid4().hex[:8]}"
    
    # Set up test based on scenario
    if scenario == "prod":
        # Test production URL format
        tracking_url = f"https://app.getrobo.xyz/api/track/{test_id}"
        target_url = "https://example.com/prod-test"
    elif scenario == "dev":
        # Test development URL format
        tracking_url = f"https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes/track/{test_id}"
        target_url = "https://example.com/dev-test"
    elif scenario == "current":
        # Test current environment URL format
        tracking_url = get_absolute_scan_url(test_id)
        target_url = "https://example.com/current-test"
    else:
        return JSONResponse(status_code=400, content={"error": f"Unknown scenario: {scenario}"})
    
    # Get client info for testing
    client_host = request.client.host if request.client else "unknown"
    headers = dict(request.headers)
    query_params = dict(request.query_params)
    
    return {
        "scenario": scenario,
        "test_id": test_id,
        "tracking_url": tracking_url,
        "target_url": target_url,
        "current_environment": str(mode),
        "track_path": TRACK_PATH,
        "client_info": {
            "host": client_host,
            "headers": headers,
            "query_params": query_params
        },
        "timestamp": int(time.time())
    }
