import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import build_agent_graph
from app.db.session import get_db
from app.schemas.chat import ChatRequest
from app.services.conversations import get_or_create_conversation, get_history_text, save_message
from app.api.deps import get_current_user
from app.db.models import User

router = APIRouter(prefix="/chat", tags=["chat"])


async def event_stream(payload: ChatRequest, db: AsyncSession, user: User):
    conversation = await get_or_create_conversation(db, user.id, payload.conversation_id, first_message=payload.question)
    history = await get_history_text(db, conversation.id)
    yield f"data: {json.dumps({'node': 'debug_history', 'output': {'history': history}})}\n\n"

    await save_message(db, conversation.id, role="user", content=payload.question)

    graph = build_agent_graph(db, user.id)

    initial_state = {
        "question": payload.question,
        "history": history,
        "route": "",
        "retrieved_chunks": [],
        "critic_notes": "",
        "final_answer": "",
    }

    final_state = {}

    async for event in graph.astream(initial_state):
        for node_name, node_output in event.items():
            final_state.update(node_output)
            data = {"node": node_name, "output": node_output}
            yield f"data: {json.dumps(data)}\n\n"

    await save_message(
        db,
        conversation.id,
        role="assistant",
        content=final_state.get("final_answer", ""),
        agent_trace=json.dumps({
            "route": final_state.get("route"),
            "critic_notes": final_state.get("critic_notes"),
            "sources_used": len(final_state.get("retrieved_chunks", [])),
        }),
    )


@router.post("")
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),):
    return StreamingResponse(
        event_stream(payload, db, user),
        media_type="text/event-stream",
    )