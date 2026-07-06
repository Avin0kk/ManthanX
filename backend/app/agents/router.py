from app.agents.state import AgentState
from app.services.llm import generate

ROUTER_SYSTEM_PROMPT = """You are a routing agent in a document Q&A system.
Given a user's question, decide whether answering it requires searching
through uploaded documents, or whether it's simple enough to answer directly
(e.g. greetings, general knowledge, meta-questions about how the system works).

Respond with exactly one word: either "retrieve" or "direct". Nothing else."""

async def router_node(state: AgentState) -> dict:
    decision = await generate(
        prompt=state["question"],
        system_instruction=ROUTER_SYSTEM_PROMPT,
    )

    route = decision.strip().lower()
    if route not in("retrieve", "direct"):
        route = "retrieve"

    return {"route": route}