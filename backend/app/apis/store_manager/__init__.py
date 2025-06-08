from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import databutton as db
import re
from datetime import datetime, timezone
import time
from app.apis.firebase_client import get_firestore_db
# Import logger for centralized logging
from app.apis.logger import error, info, log_exception, warning

router = APIRouter(prefix="/stores")

# Models
class StoreBase(BaseModel):
    """Base model for store data"""
    store_hash: str
    store_name: Optional[str] = None
    domain: Optional[str] = None

class StoreAuth(BaseModel):
    """Authentication information for a store"""
    access_token: str
    context: str
    scope: Optional[str] = None
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    created_at: int = Field(default_factory=lambda: int(time.time()))
    updated_at: int = Field(default_factory=lambda: int(time.time()))

class StoreStatus(BaseModel):
    """Status information for a store"""
    is_active: bool = True
    installation_type: str = "manual"  # "manual" or "single_click"
    last_accessed: int = Field(default_factory=lambda: int(time.time()))
    installed_at: int = Field(default_factory=lambda: int(time.time()))
    uninstalled_at: Optional[int] = None

class StoreData(StoreBase):
    """Complete store data model"""
    auth: StoreAuth
    status: StoreStatus
    metadata: Dict[str, Any] = Field(default_factory=dict)

class StoreListItem(BaseModel):
    """Basic store information for listing"""
    store_hash: str
    store_name: Optional[str] = None
    domain: Optional[str] = None
    installation_type: str
    is_active: bool
    installed_at: int

class StoreList(BaseModel):
    """List of stores"""
    stores: List[StoreListItem] = Field(default_factory=list)

class StoreUpdateData(BaseModel):
    """Data for updating store information"""
    store_name: Optional[str] = None
    domain: Optional[str] = None
    is_active: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None

# Helper functions
def sanitize_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    sanitized = re.sub(r'[^a-zA-Z0-9._-]', '', key)
    if sanitized != key:
        warning("Sanitized storage key", 
              context={"original": key, "sanitized": sanitized}, 
              source="store_manager")
    return sanitized

def get_store_key(store_hash: str) -> str:
    """Generate a standardized key for storing store data"""
    return sanitize_key(f"store_{store_hash}")

def get_store_data(store_hash: str) -> StoreData:
    """Get store data by store hash"""
    if not store_hash:
        error("Attempted to get store data with empty store hash", source="store_manager")
        raise ValueError("Store hash cannot be empty")
        
    try:
        db = get_firestore_db()
        doc_ref = db.collection('stores').document(store_hash)
        doc = doc_ref.get()
        
        if not doc.exists:
            warning(f"Store not found in Firebase", 
                   context={"store_hash": store_hash}, 
                   source="store_manager")
            raise KeyError(f"Store not found: {store_hash}")
            
        data = doc.to_dict()
        return StoreData(**data)
    except KeyError:
        raise
    except Exception as e:
        log_exception("Error getting store data", e, 
                     context={"store_hash": store_hash}, 
                     source="store_manager")
        raise KeyError(f"Error retrieving store: {store_hash}")

def save_store_data(store_data: StoreData) -> bool:
    """Save store data to Firebase"""
    try:
        db = get_firestore_db()
        doc_ref = db.collection('stores').document(store_data.store_hash)
        doc_ref.set(store_data.dict())
        info("Store data saved", 
             store_hash=store_data.store_hash, 
             context={"store_name": store_data.store_name},
             source="store_manager")
        return True
    except Exception as e:
        log_exception("Error saving store data", e,
                   store_hash=store_data.store_hash, 
                   context={"store_name": store_data.store_name},
                   source="store_manager")
        return False

def list_all_stores() -> List[StoreData]:
    """List all stored stores from Firebase"""
    try:
        db = get_firestore_db()
        stores_ref = db.collection('stores')
        stores_docs = stores_ref.stream()
        
        stores = []
        for doc in stores_docs:
            try:
                store_data = doc.to_dict()
                stores.append(StoreData(**store_data))
            except Exception as e:
                print(f"Error loading store {doc.id}: {str(e)}")
        
        return stores
    except Exception as e:
        print(f"Error listing stores: {str(e)}")
        return []

def create_store_from_token_info(token_info: Dict[str, Any], installation_type: str = "manual") -> StoreData:
    """Create a new store record from BigCommerce token information"""
    store_hash = token_info.get("store_hash")
    
    # Create store auth information
    auth = StoreAuth(
        access_token=token_info.get("access_token"),
        context=token_info.get("context"),
        user_id=token_info.get("user_id"),
        user_email=token_info.get("user_email"),
        scope=token_info.get("scope")
    )
    
    # Create store status information
    status = StoreStatus(
        is_active=True,
        installation_type=installation_type,
        installed_at=int(time.time())
    )
    
    # Create the complete store data
    store_data = StoreData(
        store_hash=store_hash,
        auth=auth,
        status=status
    )
    
    return store_data

def update_store_access(store_hash: str) -> bool:
    """Update the last accessed timestamp for a store"""
    try:
        db = get_firestore_db()
        doc_ref = db.collection('stores').document(store_hash)
        doc = doc_ref.get()
        
        if not doc.exists:
            warning("Attempted to update access time for non-existent store", 
                  context={"store_hash": store_hash},
                  source="store_manager")
            return False
            
        # Update the last_accessed field
        doc_ref.update({
            'status.last_accessed': int(time.time())
        })
        info("Updated store access timestamp", 
             store_hash=store_hash, 
             source="store_manager")
        return True
    except Exception as e:
        log_exception("Error updating store access time", e,
                    context={"store_hash": store_hash},
                    source="store_manager")
        return False

def deactivate_store(store_hash: str) -> bool:
    """Mark a store as inactive (uninstalled) in Firebase"""
    try:
        db = get_firestore_db()
        doc_ref = db.collection('stores').document(store_hash)
        doc = doc_ref.get()
        
        if not doc.exists:
            warning("Attempted to deactivate non-existent store", 
                  context={"store_hash": store_hash},
                  source="store_manager")
            return False
            
        # Update the store status
        doc_ref.update({
            'status.is_active': False,
            'status.uninstalled_at': int(time.time())
        })
        info("Store deactivated", 
             store_hash=store_hash, 
             source="store_manager")
        return True
    except Exception as e:
        log_exception("Error deactivating store", e, 
                   context={"store_hash": store_hash},
                   source="store_manager")
        return False

# Endpoints
@router.get("/")
async def get_all_stores() -> StoreList:
    """List all stores"""
    try:
        all_stores = list_all_stores()
        
        # Create a simplified list for the response
        store_list_items = []
        for store in all_stores:
            store_list_items.append(StoreListItem(
                store_hash=store.store_hash,
                store_name=store.store_name,
                domain=store.domain,
                installation_type=store.status.installation_type,
                is_active=store.status.is_active,
                installed_at=store.status.installed_at
            ))
        
        return StoreList(stores=store_list_items)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing stores: {str(e)}"
        )

@router.get("/{store_hash}")
async def get_store(store_hash: str):
    """Get details for a specific store"""
    try:
        store_data = get_store_data(store_hash)
        return store_data.dict()
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store not found: {store_hash}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving store: {str(e)}"
        )

@router.put("/{store_hash}")
async def update_store(store_hash: str, update_data: StoreUpdateData):
    """Update store information in Firebase"""
    try:
        # First check if store exists
        db = get_firestore_db()
        doc_ref = db.collection('stores').document(store_hash)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise KeyError(f"Store not found: {store_hash}")
        
        # Build update dictionary with only fields that are provided
        update_dict = {}
        
        if update_data.store_name is not None:
            update_dict['store_name'] = update_data.store_name
            
        if update_data.domain is not None:
            update_dict['domain'] = update_data.domain
            
        if update_data.is_active is not None:
            update_dict['status.is_active'] = update_data.is_active
            # If marking inactive, set uninstall timestamp
            if not update_data.is_active:
                update_dict['status.uninstalled_at'] = int(time.time())
            # If marking active again, clear uninstall timestamp
            else:
                update_dict['status.uninstalled_at'] = None
                
        if update_data.metadata is not None:
            # For metadata, we need to update individual fields to avoid overwriting
            current_data = doc.to_dict()
            current_metadata = current_data.get('metadata', {})
            
            # Merge new metadata with existing
            merged_metadata = {**current_metadata, **update_data.metadata}
            update_dict['metadata'] = merged_metadata
        
        # Apply updates if there are any
        if update_dict:
            doc_ref.update(update_dict)
            return {"status": "success", "message": "Store updated successfully"}
        else:
            return {"status": "info", "message": "No updates provided"}
            
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error updating store: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating store: {str(e)}"
        )

@router.delete("/{store_hash}")
async def delete_store(store_hash: str):
    """Delete a store from Firebase"""
    try:
        db = get_firestore_db()
        doc_ref = db.collection('stores').document(store_hash)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise KeyError(f"Store not found: {store_hash}")
        
        # Delete the store record
        doc_ref.delete()
        
        return {"status": "success", "message": "Store deleted successfully"}
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store not found: {store_hash}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting store: {str(e)}"
        )
