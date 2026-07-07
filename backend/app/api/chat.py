import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import build_agent_graph
from app.db.session import get_db
from app.schemas.chat import ChatRequest
from app.services.conversations import get_or_create_conversation, get_history_text, save_message

router = APIRouter(prefix="/chat", tags=["chat"])


async def event_stream(payload: ChatRequest, db: AsyncSession):
    conversation = await get_or_create_conversation(db, payload.conversation_id)
    history = await get_history_text(db, conversation.id)

    await save_message(db, conversation.id, role="user", content=payload.question)

    graph = build_agent_graph(db)

    initial_state = {
        "question": payload.question,
        "history": history,
        "route": "",
        "retrieved_chunks": [],
        "critic_notes": "",
        "final_answer": "",
    }

    final_state = {}

    yield f"data: {json.dumps({'node': 'conversation', 'output': {'conversation_id': str(conversation.id)}})}\n\n"

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
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    return StreamingResponse(
        event_stream(payload, db),
        media_type="text/event-stream",
    )