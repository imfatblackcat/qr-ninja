from fastapi import APIRouter, Request, Depends, HTTPException, status, Response
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
import httpx
import databutton as db
import json
from typing import Dict, Any, Optional, List
from urllib.parse import urlencode
import traceback
import re
import time
from app.apis.store_manager import create_store_from_token_info, get_store_data, update_store_access, sanitize_key

# Import logger for centralized logging
from app.apis.logger import error, info, log_exception, warning

router = APIRouter()

# Base URL for redirects
BASE_URL = "https://app.getrobo.xyz"

class AuthRequest(BaseModel):
    code: str
    scope: str
    context: str

class AuthResponse(BaseModel):
    access_token: str
    store_hash: str
    status: str = "success"
    message: str = "Successfully authenticated with BigCommerce"

@router.get("/auth_callback")
async def auth_callback(request: Request, response: Response):
    """
    Callback endpoint for BigCommerce OAuth flow.
    BigCommerce redirects to this endpoint after the user authorizes the app.
    
    This endpoint handles both manual installations and single-click installations
    from the BigCommerce App Marketplace. The flow works as follows:
    
    1. User installs the app (either manually or via single-click from marketplace)
    2. BigCommerce redirects to this endpoint with code, scope, and context
    3. We exchange the code for an access token
    4. We store the token information
    5. We redirect the user to the HelloWorld page (for all installation types)
    """
    params = dict(request.query_params)
    code = params.get("code")
    scope = params.get("scope")
    context = params.get("context")
    
    if not code or not scope or not context:
        print(f"Auth callback missing parameters: code={bool(code)}, scope={bool(scope)}, context={bool(context)}")
        error("Auth callback missing parameters", 
              context={"code_present": bool(code), "scope_present": bool(scope), "context_present": bool(context)},
              source="bigcommerce_oauth")
        error_params = urlencode({
            "status": "error", 
            "message": "Missing required parameters", 
            "error_code": "MISSING_PARAMS"
        })
        redirect_url = f"/hello-world?{error_params}"
        
        # Use direct HTTP redirect for error cases as well
        return RedirectResponse(url=redirect_url, status_code=303)
        
    # Get client_id and client_secret from secrets
    client_id = db.secrets.get("BIGCOMMERCE_CLIENT_ID")
    client_secret = db.secrets.get("BIGCOMMERCE_CLIENT_SECRET")
    redirect_uri = db.secrets.get("BIGCOMMERCE_REDIRECT_URI")
    
    if not client_id or not client_secret or not redirect_uri:
        print(f"Auth callback missing credentials: client_id={bool(client_id)}, client_secret={bool(client_secret)}, redirect_uri={bool(redirect_uri)}")
        error("Auth callback missing credentials", 
              context={"client_id_present": bool(client_id), "client_secret_present": bool(client_secret), "redirect_uri_present": bool(redirect_uri)},
              source="bigcommerce_oauth")
        error_params = urlencode({
            "status": "error", 
            "message": "App configuration error", 
            "error_code": "CONFIG_ERROR"
        })
        redirect_url = f"/hello-world?{error_params}"
        
        # Use direct HTTP redirect for error cases
        return RedirectResponse(url=redirect_url, status_code=303)
    
    # Exchange the temporary code for an access token
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://login.bigcommerce.com/oauth2/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                    "code": code,
                    "scope": scope,
                    "context": context
                }
            )
            
            if token_response.status_code != 200:
                print(f"BigCommerce authentication failed with status {token_response.status_code}: {token_response.text}")
                error("BigCommerce authentication failed", 
                      context={"status_code": token_response.status_code, "response": token_response.text},
                      source="bigcommerce_oauth")
                
                # Extract error details from response if possible
                error_message = "Authentication failed"
                error_code = "AUTH_FAILED"
                try:
                    error_data = token_response.json()
                    if "error" in error_data:
                        error_message = f"Authentication failed: {error_data.get('error_description', error_data.get('error'))}"
                        error_code = f"BC_{error_data.get('error')}".upper()
                except Exception:
                    pass
                
                error_params = urlencode({
                    "status": "error", 
                    "message": error_message,
                    "error_code": error_code
                })
                redirect_url = f"/hello-world?{error_params}"
                
                # Use direct HTTP redirect for authentication error
                return RedirectResponse(url=redirect_url, status_code=303)
            
            token_data = token_response.json()
            
            # Extract store_hash from the context
            store_hash = context.split("/")[1] if "/" in context else context
            
            # Prepare token info
            token_info = {
                "access_token": token_data["access_token"],
                "store_hash": store_hash,
                "user_id": token_data.get("user", {}).get("id"),
                "user_email": token_data.get("user", {}).get("email"),
                "context": context,
                "scope": scope,
                "timestamp": int(time.time())
            }
            
            # Check if it's a BigCommerce app load (from admin panel) or a single-click install
            is_app_load = params.get("app_load") == "true"
            single_click = params.get("single_click") == "true"
            
            print(f"Auth callback: app_load={is_app_load}, single_click={single_click}, context={context}")
            
            # Determine installation type
            installation_type = "single_click" if single_click else "manual"
            
            # Create or update store data
            try:
                # First check if the store exists
                store_data = get_store_data(store_hash)
                # Store exists, update access token and timestamps
                store_data.auth.access_token = token_info["access_token"]
                store_data.auth.updated_at = int(time.time())
                store_data.status.last_accessed = int(time.time())
                # If it was previously uninstalled, mark as active again
                if not store_data.status.is_active:
                    store_data.status.is_active = True
                    store_data.status.uninstalled_at = None
                    info("Reactivating previously uninstalled store", 
                         context={"installation_type": installation_type},
                         store_hash=store_hash,
                         source="bigcommerce_oauth")
                else:
                    info("Updating existing store token", 
                         context={"installation_type": installation_type},
                         store_hash=store_hash,
                         source="bigcommerce_oauth")
                from app.apis.store_manager import save_store_data
                save_store_data(store_data)
            except KeyError:
                # Store doesn't exist, create a new record
                store_data = create_store_from_token_info(token_info, installation_type)
                info("Creating new store record", 
                     context={"installation_type": installation_type},
                     store_hash=store_hash,
                     source="bigcommerce_oauth")
                from app.apis.store_manager import save_store_data
                save_store_data(store_data)
            
            # For both app loads from admin panel and regular/single-click installs,
            # perform a direct HTTP redirect to the Hello World page
            if is_app_load:
                # For app loads from admin, include context
                redirect_url = f"/hello-world?context={context}"
            else:
                # For both regular and single-click installs
                redirect_params = urlencode({
                    "store_hash": store_hash, 
                    "status": "success",
                    "single_click": "true" if single_click else "false"
                })
                redirect_url = f"/hello-world?{redirect_params}"
            
            info(f"Performing direct HTTP redirect to {redirect_url}", 
                 context={"is_app_load": is_app_load, "single_click": single_click},
                 store_hash=store_hash,
                 source="bigcommerce_oauth")
                
            # Use RedirectResponse for direct HTTP redirect instead of JSON+headers
            return RedirectResponse(url=redirect_url, status_code=303)
            
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Unexpected error during authentication: {str(e)}\n{error_trace}")
        log_exception("Unexpected error during authentication", e, source="bigcommerce_oauth", context={"context": context})
        
        # Determine error type for better user feedback
        error_message = "Server error while processing your request"
        error_code = "SERVER_ERROR"
        
        if "connection" in str(e).lower() or "timeout" in str(e).lower():
            error_message = "Connection error while contacting BigCommerce. Please check your network and try again."
            error_code = "CONNECTION_ERROR"
        elif "json" in str(e).lower() or "parse" in str(e).lower():
            error_message = "Error processing response from BigCommerce."
            error_code = "PARSE_ERROR"
        
        error_params = urlencode({
            "status": "error", 
            "message": error_message,
            "error_code": error_code
        })
        redirect_url = f"/hello-world?{error_params}"
        
        # Use direct HTTP redirect for unexpected errors
        return RedirectResponse(url=redirect_url, status_code=303)

class TestRedirectScenario(BaseModel):
    scenario: str
    description: str

class TestRedirectResponse(BaseModel):
    redirect_url: str
    status: str
    message: str
    headers: Optional[Dict[str, str]] = None

@router.get("/test-redirect-scenarios", response_model=List[TestRedirectScenario])
async def test_redirect_scenarios():
    """
    Get list of available redirect test scenarios
    """
    return [
        TestRedirectScenario(
            scenario="header_only", 
            description="Redirect using only HTTP headers"
        ),
        TestRedirectScenario(
            scenario="json_only", 
            description="Redirect using only JSON response"
        ),
        TestRedirectScenario(
            scenario="header_and_json", 
            description="Redirect using both HTTP headers and JSON response"
        ),
        TestRedirectScenario(
            scenario="relative_url", 
            description="Redirect using relative URL"
        ),
        TestRedirectScenario(
            scenario="absolute_url", 
            description="Redirect using absolute URL"
        )
    ]

@router.get("/test-redirect/{scenario}")
async def test_redirect_scenario(scenario: str):
    """
    Test endpoint with different redirect scenarios
    """
    test_url = "https://app.getrobo.xyz/hello-world?test=true"
    relative_url = "/hello-world?test=true&scenario=" + scenario
    
    # Log the scenario
    info(f"Testing redirect scenario: {scenario}", source="test_redirect")
    
    if scenario == "header_only":
        # Return empty response with only headers
        return Response(
            content="",
            headers={
                "X-Redirect": "true",
                "X-Redirect-URL": test_url
            }
        )
    
    elif scenario == "json_only":
        # Return JSON with redirect_url but no headers
        return {
            "redirect_url": test_url,
            "status": "success",
            "message": f"Redirect test using JSON only - scenario: {scenario}"
        }
    
    elif scenario == "header_and_json":
        # Return JSON with both redirect_url and headers
        return JSONResponse(
            content={
                "redirect_url": test_url,
                "status": "success",
                "message": f"Redirect test using both methods - scenario: {scenario}"
            },
            headers={
                "X-Redirect": "true",
                "X-Redirect-URL": test_url
            }
        )
    
    elif scenario == "relative_url":
        # Return JSON with relative URL
        return JSONResponse(
            content={
                "redirect_url": relative_url,
                "status": "success",
                "message": f"Redirect test using relative URL - scenario: {scenario}"
            },
            headers={
                "X-Redirect": "true",
                "X-Redirect-URL": relative_url
            }
        )
    
    elif scenario == "absolute_url":
        # Return JSON with absolute URL
        return JSONResponse(
            content={
                "redirect_url": test_url,
                "status": "success",
                "message": f"Redirect test using absolute URL - scenario: {scenario}"
            },
            headers={
                "X-Redirect": "true",
                "X-Redirect-URL": test_url
            }
        )
    
    else:
        # Unknown scenario
        return JSONResponse(
            content={
                "error": "Unknown test scenario",
                "available_scenarios": [s.scenario for s in await test_redirect_scenarios()]
            },
            status_code=400
        )

@router.get("/auth-url")
async def get_auth_url():
    """
    Generate and return the BigCommerce authorization URL
    """
    try:
        client_id = db.secrets.get("BIGCOMMERCE_CLIENT_ID")
        redirect_uri = db.secrets.get("BIGCOMMERCE_REDIRECT_URI")
        
        if not client_id or not redirect_uri:
            print(f"Missing BigCommerce credentials: client_id={bool(client_id)}, redirect_uri={bool(redirect_uri)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="BigCommerce credentials not configured."
            )
    
        # Define the scopes needed for the app
        scopes = [
            "store_v2_content",
            "store_v2_information"
        ]
        
        # Build the authorization URL
        auth_url = (
            f"https://login.bigcommerce.com/oauth2/authorize?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&response_type=code&scope={','.join(scopes)}"
        )
        
        print(f"Generated BigCommerce authorization URL for client_id: {client_id[:5]}...")
        return {"auth_url": auth_url}
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Failed to generate auth URL: {str(e)}\n{error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authorization URL: {str(e)}"
        )

@router.get("/stores")
async def list_stores():
    """
    List all stores that have installed the app
    """
    try:
        from app.apis.store_manager import get_all_stores
        return await get_all_stores()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing stores: {str(e)}"
        )

@router.get("/load")
async def load_callback(context: str | None = None):
    """
    Load callback for BigCommerce app
    This is called when a user loads the app from the BigCommerce admin panel
    """
    try:
        # Extract store_hash from the context
        if not context:
            info("Load callback called with empty context", source="bigcommerce_oauth")
            redirect_url = f"/hello-world?error=missing_context&message=No+store+context+provided"
            
            # Use direct HTTP redirect
            return RedirectResponse(url=redirect_url, status_code=303)
            
        store_hash = context.split("/")[1] if "/" in context else context
        info("Load callback called", context={"context": context, "extracted_hash": store_hash}, source="bigcommerce_oauth")
        
        try:
            # Get the store data and update last accessed timestamp
            store_data = get_store_data(store_hash)
            
            # Check if store is active
            if not store_data.status.is_active:
                warning("Inactive store attempted to load app", 
                       store_hash=store_hash, 
                       context={"last_accessed": store_data.status.last_accessed},
                       source="bigcommerce_oauth")
                redirect_url = f"/hello-world?error=inactive_store&message=This+app+has+been+uninstalled"
                
                # Use direct HTTP redirect
                return RedirectResponse(url=redirect_url, status_code=303)
                
            # Update last accessed timestamp
            update_store_access(store_hash)
            
            # Return basic information to confirm load
            info("Store loaded successfully", 
                store_hash=store_hash, 
                context={"store_name": store_data.store_name},
                source="bigcommerce_oauth")
                
            # Direct HTTP redirect to Hello World page with store data
            redirect_url = f"/hello-world?context={context}&store_hash={store_data.store_hash}&store_name={store_data.store_name}"
            
            info(f"Load callback performing direct redirect to {redirect_url}",
                store_hash=store_hash,
                source="bigcommerce_oauth")
                
            return RedirectResponse(url=redirect_url, status_code=303)
            
        except KeyError:
            # If store data doesn't exist, the app is not installed for this store
            warning("Store not found in database", 
                   context={"store_hash": store_hash},
                   source="bigcommerce_oauth")
            redirect_url = f"/hello-world?error=store_not_found&message=Store+not+found.+Please+install+the+app+first"
            
            # Use direct HTTP redirect
            return RedirectResponse(url=redirect_url, status_code=303)
            
    except Exception as e:
        log_exception("Error loading app", e, 
                     context={"context": context},
                     source="bigcommerce_oauth")
        redirect_url = f"/hello-world?error=server_error&message=Error+loading+app:{str(e)}"
        
        # Use direct HTTP redirect
        return RedirectResponse(url=redirect_url, status_code=303)
