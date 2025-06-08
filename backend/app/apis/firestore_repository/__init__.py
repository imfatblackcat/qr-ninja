from typing import TypeVar, Generic, Type, Dict, Any, List, Optional
from pydantic import BaseModel
from app.apis.firebase_client import get_firestore_db
from google.cloud.firestore_v1.base_query import FieldFilter
from firebase_admin import firestore
from fastapi import APIRouter

router = APIRouter()


T = TypeVar('T', bound=BaseModel)

class FirestoreRepository(Generic[T]):
    """
    Generic repository for Firestore operations with Pydantic models
    """
    def __init__(self, collection_name: str, model_class: Type[T]):
        """
        Initialize the repository with a collection name and model class
        
        Args:
            collection_name: The name of the Firestore collection
            model_class: The Pydantic model class to use for this repository
        """
        self.db = get_firestore_db()
        self.collection_name = collection_name
        self.model_class = model_class
        self.collection = self.db.collection(collection_name)
    
    def add(self, item: T, document_id: Optional[str] = None) -> str:
        """
        Add a new item to the collection
        
        Args:
            item: The item to add
            document_id: Optional document ID for the new item. If not provided, Firestore will generate one.
        
        Returns:
            The document ID of the added item
        """
        try:
            print(f"[FIRESTORE_REPO] Adding item to collection {self.collection_name}")
            item_dict = item.to_dict() if hasattr(item, 'to_dict') else item.dict()
            
            if document_id:
                print(f"[FIRESTORE_REPO] Using provided document ID: {document_id}")
                self.collection.document(document_id).set(item_dict)
                return document_id
            else:
                doc_ref = self.collection.add(item_dict)[0]
                print(f"[FIRESTORE_REPO] Generated document ID: {doc_ref.id}")
                return doc_ref.id
        except Exception as e:
            print(f"[FIRESTORE_REPO] Error adding item: {str(e)}")
            # Re-raise the exception as adding is a critical operation
            raise
    
    def get(self, document_id: str) -> Optional[T]:
        """
        Get an item by its document ID
        
        Args:
            document_id: The document ID to get
        
        Returns:
            The item if found, None otherwise
        """
        doc_ref = self.collection.document(document_id).get()
        if doc_ref.exists:
            data = doc_ref.to_dict()
            if hasattr(self.model_class, 'from_dict'):
                return self.model_class.from_dict(data)
            return self.model_class(**data)
        return None
    
    def update(self, document_id: str, item: T) -> bool:
        """
        Update an existing item
        
        Args:
            document_id: The document ID to update
            item: The updated item
        
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            print(f"[FIRESTORE_REPO] Updating document {document_id} in collection {self.collection_name}")
            item_dict = item.to_dict() if hasattr(item, 'to_dict') else item.dict()
            self.collection.document(document_id).update(item_dict)
            print(f"[FIRESTORE_REPO] Successfully updated document {document_id}")
            return True
        except Exception as e:
            print(f"[FIRESTORE_REPO] Error updating document {document_id}: {str(e)}")
            return False
    
    def delete(self, document_id: str) -> bool:
        """
        Delete an item by its document ID
        
        Args:
            document_id: The document ID to delete
        
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            print(f"[FIRESTORE] Attempting to delete document with ID: {document_id} from collection: {self.collection_name}")
            self.collection.document(document_id).delete()
            print(f"[FIRESTORE] Successfully deleted document with ID: {document_id} from collection: {self.collection_name}")
            return True
        except Exception as e:
            print(f"[FIRESTORE] Error deleting document with ID: {document_id} from collection: {self.collection_name}. Error: {str(e)}")
            return False
    
    def list(self, limit: int = 100, offset: int = 0) -> List[T]:
        """
        List items with pagination
        
        Args:
            limit: Maximum number of items to return
            offset: Offset for pagination
        
        Returns:
            List of items
        """
        try:
            print(f"[FIRESTORE_REPO] Listing from collection {self.collection_name} with limit={limit}, offset={offset}")
            query = self.collection.limit(limit).offset(offset)
            docs = query.stream()
            result = []
            
            for doc in docs:
                data = doc.to_dict()
                # Add document ID to the data if the model has an id field
                if hasattr(self.model_class, 'id') and not isinstance(self.model_class.id, property):
                    data['id'] = doc.id
                
                if hasattr(self.model_class, 'from_dict'):
                    result.append(self.model_class.from_dict(data))
                else:
                    result.append(self.model_class(**data))
            
            print(f"[FIRESTORE_REPO] List query returned {len(result)} results")
            return result
        except Exception as e:
            print(f"[FIRESTORE_REPO] Error listing documents: {str(e)}")
            # Return empty list on error to prevent app crashes
            return []
    
    def query_by_field(self, field: str, value: Any, operator: str = "==") -> List[T]:
        """
        Query items by a field value
        
        Args:
            field: The field to query by
            value: The value to compare against
            operator: The comparison operator (==, >, <, >=, <=, !=, in, array_contains)
        
        Returns:
            List of matching items
        """
        try:
            print(f"[FIRESTORE_REPO] Querying {self.collection_name} where {field} {operator} {value}")
            query = self.collection.where(filter=FieldFilter(field, operator, value))
            docs = query.stream()
            result = []
            
            for doc in docs:
                data = doc.to_dict()
                # Add document ID to the data if the model has an id field
                if hasattr(self.model_class, 'id') and not isinstance(self.model_class.id, property):
                    data['id'] = doc.id
                
                if hasattr(self.model_class, 'from_dict'):
                    result.append(self.model_class.from_dict(data))
                else:
                    result.append(self.model_class(**data))
            
            print(f"[FIRESTORE_REPO] Query returned {len(result)} results")
            return result
        except Exception as e:
            print(f"[FIRESTORE_REPO] Error querying by field {field}: {str(e)}")
            # Return empty list on error to prevent app crashes
            return []
    
    def count(self) -> int:
        """
        Count documents in the collection
        
        Returns:
            Number of documents in the collection
        """
        return len(list(self.collection.stream()))
    

            
    def batch_add(self, items: List[T]) -> List[str]:
        """
        Add multiple items in a batch operation
        
        Args:
            items: List of items to add
        
        Returns:
            List of document IDs
        """
        batch = self.db.batch()
        doc_refs = []
        
        for item in items:
            item_dict = item.to_dict() if hasattr(item, 'to_dict') else item.dict()
            doc_ref = self.collection.document()
            batch.set(doc_ref, item_dict)
            doc_refs.append(doc_ref)
        
        batch.commit()
        return [ref.id for ref in doc_refs]
