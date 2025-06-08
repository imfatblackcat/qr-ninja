from typing import Dict, List, Any, Optional, Callable, Union, Tuple
import uuid
import time

from fastapi import APIRouter

# Create an empty router to satisfy Databutton API module requirements
# This is a utility module, not an API endpoint module
router = APIRouter()


class FieldFilter:
    """Simplified implementation of Firestore's FieldFilter"""
    def __init__(self, field, op, value):
        self.field = field
        self.op = op
        self.value = value

    def matches(self, document_data: Dict[str, Any]) -> bool:
        """Check if document matches this filter"""
        if self.field not in document_data:
            return False
        
        doc_value = document_data[self.field]
        
        if self.op == "==":
            return doc_value == self.value
        elif self.op == "!=":
            return doc_value != self.value
        elif self.op == ">":
            return doc_value > self.value
        elif self.op == ">=":
            return doc_value >= self.value
        elif self.op == "<":
            return doc_value < self.value
        elif self.op == "<=":
            return doc_value <= self.value
        elif self.op == "in":
            return doc_value in self.value
        elif self.op == "array_contains":
            return isinstance(doc_value, list) and self.value in doc_value
        
        # If unknown operator, default to false
        return False


class DocumentSnapshot:
    """Mock implementation of Firestore DocumentSnapshot"""
    
    def __init__(self, id: str, data: Dict[str, Any], exists: bool = True):
        self.id = id
        self._data = data
        self._exists = exists
    
    def to_dict(self) -> Dict[str, Any]:
        """Return the document data as a dictionary"""
        return self._data.copy() if self._data else {}
    
    @property
    def exists(self) -> bool:
        """Whether the document exists"""
        return self._exists
    

class DocumentReference:
    """Mock implementation of Firestore DocumentReference"""
    
    def __init__(self, id: str, collection: 'InMemoryCollection'):
        self.id = id
        self._collection = collection
    
    def get(self) -> DocumentSnapshot:
        """Get the document snapshot"""
        data = self._collection._documents.get(self.id)
        return DocumentSnapshot(self.id, data or {}, exists=data is not None)
    
    def set(self, data: Dict[str, Any]) -> None:
        """Set document data"""
        if self.id not in self._collection._documents:
            print(f"[INMEM_FIRESTORE] Creating new document with ID: {self.id}")
        else:
            print(f"[INMEM_FIRESTORE] Updating document with ID: {self.id}")
            
        self._collection._documents[self.id] = data.copy()
    
    def update(self, data: Dict[str, Any]) -> None:
        """Update document data"""
        if self.id not in self._collection._documents:
            print(f"[INMEM_FIRESTORE] Document {self.id} doesn't exist, creating it with update data")
            self._collection._documents[self.id] = data.copy()
        else:
            print(f"[INMEM_FIRESTORE] Updating existing document with ID: {self.id}")
            self._collection._documents[self.id].update(data)
    
    def delete(self) -> None:
        """Delete the document"""
        if self.id in self._collection._documents:
            print(f"[INMEM_FIRESTORE] Deleting document with ID: {self.id}")
            del self._collection._documents[self.id]
            return True
        else:
            print(f"[INMEM_FIRESTORE] Document with ID {self.id} not found for deletion")
            return False


class QuerySnapshotIterator:
    """Iterator for QuerySnapshot"""
    
    def __init__(self, documents: List[DocumentSnapshot]):
        self._documents = documents
        self._index = 0
    
    def __iter__(self):
        return self
    
    def __next__(self) -> DocumentSnapshot:
        if self._index < len(self._documents):
            doc = self._documents[self._index]
            self._index += 1
            return doc
        raise StopIteration


class QuerySnapshot:
    """Mock implementation of Firestore QuerySnapshot"""
    
    def __init__(self, documents: List[DocumentSnapshot]):
        self._documents = documents
    
    def __iter__(self):
        return QuerySnapshotIterator(self._documents)


class InMemoryQuery:
    """Mock implementation of Firestore Query"""
    
    def __init__(self, collection: 'InMemoryCollection', filters: List[FieldFilter] = None, limit_val: int = None, offset_val: int = 0):
        self._collection = collection
        self._filters = filters or []
        self._limit = limit_val
        self._offset = offset_val
    
    def where(self, filter: FieldFilter) -> 'InMemoryQuery':
        """Add a filter to the query"""
        new_filters = self._filters.copy()
        new_filters.append(filter)
        return InMemoryQuery(self._collection, new_filters, self._limit, self._offset)
    
    def limit(self, limit_val: int) -> 'InMemoryQuery':
        """Limit the number of results"""
        return InMemoryQuery(self._collection, self._filters, limit_val, self._offset)
    
    def offset(self, offset_val: int) -> 'InMemoryQuery':
        """Skip the first n results"""
        return InMemoryQuery(self._collection, self._filters, self._limit, offset_val)
    
    def stream(self) -> QuerySnapshot:
        """Get a stream of the query results"""
        # Get all documents
        all_docs = self._collection._documents
        
        # Apply filters
        filtered_docs = {}
        for doc_id, doc_data in all_docs.items():
            matches = True
            for filter_obj in self._filters:
                if not filter_obj.matches(doc_data):
                    matches = False
                    break
            if matches:
                filtered_docs[doc_id] = doc_data
        
        # Apply pagination
        paginated_docs = list(filtered_docs.items())
        if self._offset:
            paginated_docs = paginated_docs[self._offset:]
        if self._limit is not None:
            paginated_docs = paginated_docs[:self._limit]
        
        # Create document snapshots
        snapshots = [DocumentSnapshot(doc_id, doc_data) for doc_id, doc_data in paginated_docs]
        
        return QuerySnapshot(snapshots)


class InMemoryCollection:
    """Mock implementation of Firestore Collection"""
    
    def __init__(self, name: str):
        self.name = name
        self._documents: Dict[str, Dict[str, Any]] = {}
        print(f"[INMEM_FIRESTORE] Created collection: {name}")
    
    def document(self, document_id: str = None) -> DocumentReference:
        """Get a document reference"""
        if document_id is None:
            # Generate a random ID if none is provided
            document_id = str(uuid.uuid4())
        
        return DocumentReference(document_id, self)
    
    def add(self, document_data: Dict[str, Any]) -> Tuple[DocumentReference, str]:
        """Add a new document with auto-generated ID"""
        doc_id = str(uuid.uuid4())
        doc_ref = self.document(doc_id)
        doc_ref.set(document_data)
        return doc_ref, doc_id
    
    def where(self, filter: FieldFilter) -> InMemoryQuery:
        """Create a query with a filter"""
        return InMemoryQuery(self, [filter])
    
    def limit(self, limit_val: int) -> InMemoryQuery:
        """Create a query with a limit"""
        return InMemoryQuery(self, [], limit_val)
    
    def offset(self, offset_val: int) -> InMemoryQuery:
        """Create a query with an offset"""
        return InMemoryQuery(self, [], None, offset_val)
    
    def stream(self) -> QuerySnapshot:
        """Get a stream of all documents in the collection"""
        snapshots = [DocumentSnapshot(doc_id, doc_data) for doc_id, doc_data in self._documents.items()]
        return QuerySnapshot(snapshots)


class InMemoryFirestore:
    """Mock implementation of Firestore Client"""
    
    def __init__(self):
        self._collections: Dict[str, InMemoryCollection] = {}
        print("[INMEM_FIRESTORE] Initialized in-memory Firestore mock")
    
    def collection(self, collection_name: str) -> InMemoryCollection:
        """Get a collection reference"""
        if collection_name not in self._collections:
            self._collections[collection_name] = InMemoryCollection(collection_name)
        
        return self._collections[collection_name]
    
    def batch(self):
        """Create a write batch"""
        return InMemoryBatch(self)


class InMemoryBatch:
    """Mock implementation of Firestore WriteBatch"""
    
    def __init__(self, firestore: InMemoryFirestore):
        self._firestore = firestore
        self._operations = []
    
    def set(self, doc_ref: DocumentReference, data: Dict[str, Any]):
        """Set a document"""
        self._operations.append(("set", doc_ref, data))
        return self
    
    def update(self, doc_ref: DocumentReference, data: Dict[str, Any]):
        """Update a document"""
        self._operations.append(("update", doc_ref, data))
        return self
    
    def delete(self, doc_ref: DocumentReference):
        """Delete a document"""
        self._operations.append(("delete", doc_ref, None))
        return self
    
    def commit(self):
        """Commit the batch"""
        for op_type, doc_ref, data in self._operations:
            if op_type == "set":
                doc_ref.set(data)
            elif op_type == "update":
                doc_ref.update(data)
            elif op_type == "delete":
                doc_ref.delete()
        
        result = self._operations.copy()
        self._operations = []
        return result
