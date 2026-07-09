from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.state import AgentState
from app.services.retrieval import retrieve_relevant_chunks

def make_researcher_node(db: AsyncSession, user_id):
    """
    Returns a node function with the db session baked in via closure.
    LangGraph nodes only receive (state) as an argument, but retrieval
    needs a db session - this pattern lets us inject it without changing
    the node's signature.
    """

    async def researcher_node(state: AgentState) -> dict:
        if state.get("route") == "direct":
            return {"retrieved_chunks": []}
        
        chunks = await retrieve_relevant_chunks(db, user_id, query=state["question"], top_k=5)
        return {"retrieved_chunks": chunks}
    
    return researcher_node