import uuid
from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    conversation_id: uuid.UUID | None = None

class ChatResponse(BaseModel):
    answer: str
    route: str
    critic_notes: str
    sources_used: int
    coversation_id: uuid.UUID