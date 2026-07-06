from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Chunk, Document
from app.db.session import get_db
from app.schemas.document import DocumentOut, DocumentUploadResponse
from app.services.file_parsing import UnsupportedFileType
from app.services.ingestion import ingest_document

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
MAX_FILE_SIZE_MB = 20

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile, db: AsyncSession = Depends(get_db)):
    ext = file.filename.lower().rsplit(".", 1)[-1] if file.filename and "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type ' .{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File size exceeds {MAX_FILE_SIZE_MB} MB limit.")
    
    try:
        document = await ingest_document(db, file.filename, content)
    except UnsupportedFileType as e:
        raise HTTPException(400, str(e))
    except ValueError as e:
        raise HTTPException(422, str(e))
    
    result = await db.execute(select(Chunk).where(Chunk.document_id == document.id))
    chunk_count = len(result.scalars().all())

    return DocumentUploadResponse(document=DocumentOut.model_validate(document), chunk_count=chunk_count)

@router.get("", response_model=list[DocumentOut])
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    return result.scalars().all()

@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    document = await db.get(Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    
    await db.delete(document)
    await db.commit()