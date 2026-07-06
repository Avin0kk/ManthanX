from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import build_agent_graph
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    graph = build_agent_graph(db)

    result = await graph.ainvoke({
        "question": payload.question,
        "route": "",
        "retrieved_chunks": [],
        "critic_notes": "",
        "final_answer": "",
    })

    return ChatResponse(
        answer=result["final_answer"],
        route=result["route"],
        critic_notes=result["critic_notes"],
        sources_used=len(result["retrieved_chunks"]),
    )