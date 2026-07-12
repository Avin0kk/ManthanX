import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    source_type: str
    summary: str | None
    created_at: datetime

class DocumentUploadResponse(BaseModel):
    document: DocumentOut
    chunk_count: int

class ChunkResult(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    chunk_index: int
    content: str
    similarity: float