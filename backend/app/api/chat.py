import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import build_agent_graph
from app.db.session import get_db
from app.schemas.chat import ChatRequest

router = APIRouter(prefix="/chat", tags=["chat"])


async def event_stream(payload: ChatRequest, db: AsyncSession):
    graph = build_agent_graph(db)

    initial_state = {
        "question": payload.question,
        "route": "",
        "retrieved_chunks": [],
        "critic_notes": "",
        "final_answer": "",
    }

    async for event in graph.astream(initial_state):
        # event is a dict like {"router": {"route": "retrieve"}} - one key per node that just ran
        for node_name, node_output in event.items():
            data = {"node": node_name, "output": node_output}
            yield f"data: {json.dumps(data)}\n\n"


@router.post("")
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    return StreamingResponse(
        event_stream(payload, db),
        media_type="text/event-stream",
    )