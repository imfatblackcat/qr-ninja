from pydantic import BaseModel, Field, EmailStr
from typing import Dict, Any, Optional, List
import time
from fastapi import APIRouter, HTTPException, Path, status
from app.apis.firestore_repository import FirestoreRepository

# Initialize router
router = APIRouter(prefix="/users", tags=["users"])


class UserPreferences(BaseModel):
    """
    User preferences for app settings
    """
    notifications: bool = True
    theme: str = "light"  # "light", "dark"
    language: str = "en"  # ISO language code


class User(BaseModel):
    """
    App user with role-based permissions
    """
    email: str  # Primary key
    name: Optional[str] = None
    role: str = "viewer"  # "admin", "editor", "viewer"
    stores: List[str] = Field(default_factory=list)  # List of store_hash values
    created_at: int = Field(default_factory=lambda: int(time.time()))
    last_login: Optional[int] = None
    status: str = "active"  # "active", "inactive", "invited"
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to a dictionary suitable for Firestore
        """
        return self.dict()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """
        Create a User instance from a Firestore document
        """
        return cls(**data)


# Initialize repository
user_repo = FirestoreRepository[User](collection_name="users", model_class=User)


# Response models
class UserResponse(BaseModel):
    email: str
    name: Optional[str] = None
    role: str
    stores: List[str]
    status: str
    preferences: UserPreferences


class StatusResponse(BaseModel):
    status: str
    message: str
    user_id: Optional[str] = None


# Endpoints
@router.get("/", response_model=List[UserResponse])
def list_users():
    """
    List all users in the system
    """
    try:
        users = user_repo.list()
        return [UserResponse(
            email=user.email,
            name=user.name,
            role=user.role,
            stores=user.stores,
            status=user.status,
            preferences=user.preferences
        ) for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )


@router.get("/{email}", response_model=UserResponse)
def get_user(email: str = Path(..., description="User email address")):
    """
    Get a specific user by email
    """
    try:
        users = user_repo.query_by_field("email", email)
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {email} not found"
            )
        
        user = users[0]
        return UserResponse(
            email=user.email,
            name=user.name,
            role=user.role,
            stores=user.stores,
            status=user.status,
            preferences=user.preferences
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )


class CreateUserRequest(BaseModel):
    email: str  # We'll use str instead of EmailStr to avoid additional dependencies
    name: Optional[str] = None
    role: str = "viewer"
    stores: List[str] = Field(default_factory=list)
    preferences: Optional[UserPreferences] = None


@router.post("/", response_model=StatusResponse)
def create_user(request: CreateUserRequest):
    """
    Create a new user
    """
    try:
        # Check if user already exists
        existing_users = user_repo.query_by_field("email", request.email)
        if existing_users:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email {request.email} already exists"
            )
        
        # Create new user
        user = User(
            email=request.email,
            name=request.name,
            role=request.role,
            stores=request.stores,
            preferences=request.preferences or UserPreferences()
        )
        
        # Save to database
        user_repo.add(user, document_id=user.email)
        
        return StatusResponse(
            status="success",
            message="User created successfully",
            user_id=user.email
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    stores: Optional[List[str]] = None
    preferences: Optional[UserPreferences] = None


@router.put("/{email}", response_model=StatusResponse)
def update_user(email: str, request: UpdateUserRequest):
    """
    Update user details
    """
    try:
        # Check if user exists
        users = user_repo.query_by_field("email", email)
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {email} not found"
            )
        
        user = users[0]
        
        # Update fields if provided
        if request.name is not None:
            user.name = request.name
            
        if request.role is not None:
            user.role = request.role
            
        if request.status is not None:
            user.status = request.status
            
        if request.stores is not None:
            user.stores = request.stores
            
        if request.preferences is not None:
            user.preferences = request.preferences
        
        # Save to database
        user_repo.update(user.email, user)
        
        return StatusResponse(
            status="success",
            message="User updated successfully",
            user_id=user.email
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )


@router.delete("/{email}", response_model=StatusResponse)
def delete_user(email: str):
    """
    Delete a user
    """
    try:
        # Check if user exists
        users = user_repo.query_by_field("email", email)
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {email} not found"
            )
        
        # Delete user
        user_repo.delete(email)
        
        return StatusResponse(
            status="success",
            message="User deleted successfully",
            user_id=email
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )
