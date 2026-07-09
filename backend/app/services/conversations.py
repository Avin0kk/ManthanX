import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Conversation, Message

async def get_or_create_conversation(db: AsyncSession, user_id, conversation_id: uuid.UUID | None) -> Conversation:
    if conversation_id:
        conversation = await db.get(Conversation, conversation_id)
        if conversation and conversation.user_id == user_id:
            return conversation
        
    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    await db.flush()
    return conversation

async def get_history_text(db: AsyncSession, conversation_id: uuid.UUID, limit: int = 10) -> str:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    messages = result.scalars().all()

    if not messages:
        return "(no prior message)"
    
    return "\n".join(f"{m.role}: {m.content}" for m in messages)

async def save_message(db: AsyncSession, conversation_id: uuid.UUID, role: str, content: str, agent_trace: str | None = None) -> Message:
    message = Message(conversation_id=conversation_id, role=role, content=content, agent_trace=agent_trace)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message