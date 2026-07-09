from sqlalchemy.ext.asyncio import AsyncSession
from langgraph.graph import StateGraph, START, END

from app.agents.state import AgentState
from app.agents.router import router_node
from app.agents.researcher import make_researcher_node
from app.agents.critic import critic_node
from app.agents.synthesizer import synthesizer_node

def build_agent_graph(db: AsyncSession, user_id):
    graph = StateGraph(AgentState)

    graph.add_node("router", router_node)
    graph.add_node("researcher", make_researcher_node(db, user_id))
    graph.add_node("critic", critic_node)
    graph.add_node("synthesizer", synthesizer_node)

    graph.add_edge(START, "router")
    graph.add_edge("router", "researcher")
    graph.add_edge("researcher", "critic")
    graph.add_edge("critic", "synthesizer")
    graph.add_edge("synthesizer", END)

    return graph.compile()