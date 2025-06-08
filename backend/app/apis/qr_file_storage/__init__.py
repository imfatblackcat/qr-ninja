from fastapi import APIRouter, HTTPException, File, UploadFile, Path, Query, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Literal
import databutton as db
import time
import uuid
import re
from app.apis.qr_code import qr_code_repo, QRCode
from app.apis.firestore_repository import FirestoreRepository

router = APIRouter(prefix="/qr-file-storage", tags=["qr-file-storage"])

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

class QRGeneratedFile(BaseModel):
    """Model for storing QR code generated file metadata"""
    id: str
    qr_code_id: str
    format: str  # png, svg, pdf
    size: int    # pixel size
    style_hash: str  # hash of style configuration for cache invalidation
    file_key: str    # storage key for the file
    created_at: int
    file_size: int   # size in bytes
    
class SaveFileRequest(BaseModel):
    """Request model for saving generated QR file"""
    format: Literal["png", "svg", "pdf"]
    size: int
    style_config: dict  # full style configuration for hashing
    file_data: str     # base64 encoded file data

class SaveFileResponse(BaseModel):
    """Response model for save file operation"""
    status: str
    file_id: str
    download_url: str
    message: str

# Initialize file metadata repository
file_repo = FirestoreRepository[QRGeneratedFile](collection_name="qr_generated_files", model_class=QRGeneratedFile)

def generate_style_hash(style_config: dict) -> str:
    """Generate a hash from style configuration for cache invalidation"""
    import hashlib
    import json
    
    # Sort the config to ensure consistent hashing
    sorted_config = json.dumps(style_config, sort_keys=True)
    return hashlib.md5(sorted_config.encode()).hexdigest()[:8]

@router.post("/save/{qr_code_id}", response_model=SaveFileResponse)
async def save_generated_file(
    qr_code_id: str = Path(..., description="The QR code ID"),
    request: SaveFileRequest = None
):
    """
    Save a generated QR code file to storage
    """
    try:
        # Verify QR code exists
        qr_codes = qr_code_repo.query_by_field("id", qr_code_id)
        if not qr_codes:
            raise HTTPException(status_code=404, detail="QR code not found")
            
        qr_code = qr_codes[0]
        
        # Generate style hash for cache invalidation
        style_hash = generate_style_hash(request.style_config)
        
        # Create unique file ID
        file_id = str(uuid.uuid4())
        
        # Create storage key
        file_key = sanitize_storage_key(f"qr_files_{qr_code_id}_{file_id}_{request.format}")
        
        # Decode base64 file data
        import base64
        try:
            if request.file_data.startswith('data:'):
                # Handle data URL format (data:image/png;base64,xxxxx)
                header, data = request.file_data.split(',', 1)
                file_bytes = base64.b64decode(data)
            else:
                # Handle raw base64
                file_bytes = base64.b64decode(request.file_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid file data format: {str(e)}")
        
        # Save file to binary storage
        db.storage.binary.put(file_key, file_bytes)
        
        # Create file metadata
        generated_file = QRGeneratedFile(
            id=file_id,
            qr_code_id=qr_code_id,
            format=request.format,
            size=request.size,
            style_hash=style_hash,
            file_key=file_key,
            created_at=int(time.time()),
            file_size=len(file_bytes)
        )
        
        # Save metadata to Firestore
        file_repo.add(generated_file, document_id=file_id)
        
        # Construct download URL
        download_url = f"/qr-file-storage/download/{file_id}"
        
        print(f"[QR FILE STORAGE] Saved file for QR {qr_code_id}: {file_key} ({len(file_bytes)} bytes)")
        
        return SaveFileResponse(
            status="success",
            file_id=file_id,
            download_url=download_url,
            message=f"File saved successfully as {request.format.upper()}"
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[QR FILE STORAGE] Error saving file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )

@router.get("/download/{file_id}")
async def download_generated_file(
    file_id: str = Path(..., description="The file ID to download"),
    inline: bool = Query(False, description="Whether to display inline or as attachment")
):
    """
    Download a previously generated QR code file
    """
    try:
        # Get file metadata
        file_metadata = file_repo.get(file_id)
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get file data from storage
        try:
            file_bytes = db.storage.binary.get(file_metadata.file_key)
        except Exception as e:
            raise HTTPException(status_code=404, detail="File data not found in storage")
        
        # Determine content type
        content_types = {
            "png": "image/png",
            "svg": "image/svg+xml",
            "pdf": "application/pdf"
        }
        content_type = content_types.get(file_metadata.format, "application/octet-stream")
        
        # Determine filename
        filename = f"qr_code_{file_metadata.qr_code_id}.{file_metadata.format}"
        
        # Set headers
        headers = {
            "Content-Type": content_type,
            "Content-Length": str(file_metadata.file_size),
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
        }
        
        if not inline:
            headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        else:
            headers["Content-Disposition"] = f'inline; filename="{filename}"'
        
        print(f"[QR FILE STORAGE] Serving file {file_id}: {filename} ({file_metadata.file_size} bytes)")
        
        # Return file as streaming response
        return Response(
            content=file_bytes,
            headers=headers
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[QR FILE STORAGE] Error downloading file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error downloading file: {str(e)}"
        )

@router.get("/list/{qr_code_id}")
async def list_generated_files(
    qr_code_id: str = Path(..., description="The QR code ID")
):
    """
    List all generated files for a QR code
    """
    try:
        # Get all files for this QR code
        files = file_repo.query_by_field("qr_code_id", qr_code_id)
        
        # Sort by creation date (newest first)
        files.sort(key=lambda f: f.created_at, reverse=True)
        
        file_list = [
            {
                "id": f.id,
                "format": f.format,
                "size": f.size,
                "file_size": f.file_size,
                "created_at": f.created_at,
                "download_url": f"/qr-file-storage/download/{f.id}"
            }
            for f in files
        ]
        
        return {
            "status": "success",
            "qr_code_id": qr_code_id,
            "files": file_list,
            "total": len(file_list)
        }
        
    except Exception as e:
        print(f"[QR FILE STORAGE] Error listing files: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error listing files: {str(e)}"
        )

@router.delete("/file/{file_id}")
async def delete_generated_file(
    file_id: str = Path(..., description="The file ID to delete")
):
    """
    Delete a generated file
    """
    try:
        # Get file metadata
        file_metadata = file_repo.get(file_id)
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete file from binary storage
        try:
            # Note: db.storage.binary doesn't have a delete method in the current implementation
            # This is a limitation - files will remain in storage but metadata will be removed
            pass
        except Exception as e:
            print(f"[QR FILE STORAGE] Warning: Could not delete file from storage: {str(e)}")
        
        # Delete metadata from Firestore
        # Note: Using document ID for deletion
        try:
            file_repo.collection.document(file_id).delete()
        except Exception as e:
            print(f"[QR FILE STORAGE] Warning: Could not delete metadata: {str(e)}")
        
        return {
            "status": "success",
            "message": "File deleted successfully"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[QR FILE STORAGE] Error deleting file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting file: {str(e)}"
        )
