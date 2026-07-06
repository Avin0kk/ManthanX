import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    source_type: str
    created_at: datetime

class DocumentUploadResponse(BaseModel):
    document: DocumentOut
    chunk_count: int