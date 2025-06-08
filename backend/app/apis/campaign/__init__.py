from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import time
import uuid
from fastapi import APIRouter

router = APIRouter()


class Campaign(BaseModel):
    """
    Marketing campaign that groups QR codes together
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_hash: str
    name: str
    description: Optional[str] = None
    start_date: Optional[int] = None
    end_date: Optional[int] = None
    status: str = "draft"  # "draft", "active", "completed", "archived"
    created_at: int = Field(default_factory=lambda: int(time.time()))
    updated_at: int = Field(default_factory=lambda: int(time.time()))
    created_by: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to a dictionary suitable for Firestore
        """
        return self.dict()
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Campaign':
        """
        Create a Campaign instance from a Firestore document
        """
        return cls(**data)
