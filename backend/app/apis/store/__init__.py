from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import time
from fastapi import APIRouter, HTTPException, Path, Query, Body, Depends

router = APIRouter()

class StoreAuth(BaseModel):
    """
    Authentication information for a store
    """
    access_token: str
    context: str
    scope: Optional[str] = None
    expires_at: Optional[int] = None

class StoreStatus(BaseModel):
    """
    Status information for a store installation
    """
    active: bool = True
    last_accessed: int = Field(default_factory=lambda: int(time.time()))
    installed_at: int = Field(default_factory=lambda: int(time.time()))
    uninstalled_at: Optional[int] = None

class Store(BaseModel):
    """
    Store model
    """
    store_hash: str
    store_name: Optional[str] = None
    domain: Optional[str] = None
    email: Optional[str] = None
    admin_domain: Optional[str] = None
    control_panel_domain: Optional[str] = None
    installation_type: str = "app"  # "app", "connector", "single_click"
    auth: StoreAuth
    status: StoreStatus
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to a dictionary suitable for Firestore
        """
        data = self.dict(exclude_none=True)
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Store':
        """
        Create model from Firestore dictionary
        """
        return cls(**data)


# Response Models
class StoreResponse(BaseModel):
    store: Store


class StoreListResponse(BaseModel):
    stores: List[Store]
    count: int


class CreateStoreRequest(BaseModel):
    store_hash: str
    store_name: Optional[str] = None
    domain: Optional[str] = None
    auth: StoreAuth
    status: Optional[StoreStatus] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateStoreRequest(BaseModel):
    store_name: Optional[str] = None
    domain: Optional[str] = None
    auth: Optional[StoreAuth] = None
    status: Optional[StoreStatus] = None
    metadata: Optional[Dict[str, Any]] = None


# Endpoints
@router.get("/{store_hash}", response_model=StoreResponse)
def get_store2(store_hash: str = Path(..., description="The unique hash identifier for the store")):
    """
    Get a store by its hash.
    """
    # In a real implementation, this would fetch from the database
    # This is a placeholder implementation
    store_auth = StoreAuth(
        access_token="sample_access_token",
        context="stores/{store_hash}",
        scope="store_v2_products",
        user_id=1,
        user_email="admin@example.com"
    )
    
    store_status = StoreStatus(
        is_active=True,
        installation_type="single_click",
        last_accessed=int(time.time())
    )
    
    store = Store(
        store_hash=store_hash,
        store_name="Sample Store",
        domain="store.example.com",
        auth=store_auth,
        status=store_status,
        metadata={"plan": "plus", "employees": 5}
    )
    
    return StoreResponse(store=store)


@router.get("/list", response_model=StoreListResponse)
def list_stores2(
    active_only: bool = Query(True, description="Only list active stores"),
    limit: int = Query(10, description="Maximum number of results to return"),
    offset: int = Query(0, description="Number of results to skip")
):
    """
    List all stores with optional filtering.
    """
    # In a real implementation, this would fetch from the database
    # This is a placeholder implementation
    stores = [
        Store(
            store_hash=f"store_{i}",
            store_name=f"Sample Store {i}",
            domain=f"store{i}.example.com",
            auth=StoreAuth(
                access_token=f"sample_access_token_{i}",
                context=f"stores/store_{i}",
                scope="store_v2_products",
                user_id=i,
                user_email=f"admin{i}@example.com"
            ),
            status=StoreStatus(
                is_active=True if i % 2 == 0 else False,
                installation_type="single_click" if i % 2 == 0 else "manual",
                last_accessed=int(time.time()) - (i * 86400)  # Different last access times
            ),
            metadata={"plan": "plus" if i % 2 == 0 else "standard", "employees": i * 5}
        )
        for i in range(1, 11)
    ]
    
    # Apply active_only filter
    if active_only:
        stores = [store for store in stores if store.status.is_active]
    
    # Get total count before pagination
    total_count = len(stores)
    
    # Apply pagination
    stores = stores[offset:offset + limit]
    
    return StoreListResponse(stores=stores, count=total_count)


@router.post("/create", response_model=StoreResponse, status_code=201)
def create_store2(store_data: CreateStoreRequest):
    """
    Create a new store.
    """
    # In a real implementation, this would save to the database
    # This is a placeholder implementation
    
    # Create a default status if none provided
    status = store_data.status or StoreStatus()
    
    new_store = Store(
        store_hash=store_data.store_hash,
        store_name=store_data.store_name,
        domain=store_data.domain,
        auth=store_data.auth,
        status=status,
        metadata=store_data.metadata or {}
    )
    
    return StoreResponse(store=new_store)


@router.put("/{store_hash}", response_model=StoreResponse)
def update_store2(store_hash: str = Path(..., description="The unique hash identifier for the store")):
    """
    Update an existing store.
    """
    # In a real implementation, this would update in the database
    # This is a placeholder implementation
    
    # Get the store data from the request body
    from fastapi import Request
    import json
    async def get_body(request: Request):
        return await request.json()
    
    # For this placeholder, we'll create a default update request
    store_data = UpdateStoreRequest(store_name="Updated Store Name")
    
    # First get the existing store (simulated here)
    existing_store = Store(
        store_hash=store_hash,
        store_name="Old Store Name",
        domain="old-store.example.com",
        auth=StoreAuth(
            access_token="old_access_token",
            context=f"stores/{store_hash}",
            scope="store_v2_products",
            user_id=1,
            user_email="admin@example.com"
        ),
        status=StoreStatus(
            is_active=True,
            installation_type="manual",
            last_accessed=int(time.time()) - 86400  # 1 day ago
        ),
        metadata={"plan": "standard", "employees": 3}
    )
    
    # Update fields if provided
    if store_data.store_name is not None:
        existing_store.store_name = store_data.store_name
    
    if store_data.domain is not None:
        existing_store.domain = store_data.domain
    
    if store_data.auth is not None:
        existing_store.auth = store_data.auth
    
    if store_data.status is not None:
        existing_store.status = store_data.status
    
    if store_data.metadata is not None:
        existing_store.metadata = store_data.metadata
    
    # Update the timestamp
    existing_store.auth.updated_at = int(time.time())
    
    return StoreResponse(store=existing_store)


@router.delete("/{store_hash}", status_code=204)
def delete_store2(store_hash: str = Path(..., description="The unique hash identifier for the store")):
    """
    Delete a store by its hash.
    """
    # In a real implementation, this would delete from the database
    # or mark as deleted/inactive
    # This is a placeholder implementation - no return value needed for 204 status
    pass
