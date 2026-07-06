from app.agents.state import AgentState
from app.services.llm import generate

ROUTER_SYSTEM_PROMPT = """You are a routing agent in a document Q&A system.
The user has uploaded personal documents (like resumes, reports, or notes)
into this system. Given a user's question, decide whether answering it
requires searching those uploaded documents, or whether it's simple enough
to answer directly.

Questions about "my"/"your" details (name, experience, projects, skills,
location, dates, or anything a personal document would contain) should
ALWAYS be treated as needing document search - the answer likely exists
in an uploaded document, not in general knowledge.

Only use "direct" for things like greetings, small talk, or questions about
how this system itself works.

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