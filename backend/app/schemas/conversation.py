import uuid 
from datetime import datetime

from pydantic import BaseModel, ConfigDict

class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime

class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    agent_trace: str | None
    created_at: datetime

class ConversationRename(BaseModel):
    title: str
    