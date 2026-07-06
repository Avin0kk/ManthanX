from app.agents.state import AgentState
from app.services.llm import generate

CRITIC_SYSTEM_PROMPT = """You are a critic agent in a document Q&A system.
You will be given a user's question and a set of retrieved text chunks from
their documents. Your job is to check whether the retrieved chunks actually
contain enough relevant information to answer the question.

Respond with a short assessment (1-2 sentences). If the chunks look
relevant and sufficient, say so briefly. If they look irrelevant, incomplete,
or insufficient to answer the question confidently, say so clearly and
explain what's missing.

Do not answer the question yourself - only assess the retrieved material."""

async def critic_node(state: AgentState) -> dict:
    if state.get("route") == "direct":
        return {"critic_notes": "No retrieval was performed for this direct query."}
    
    chunks = state.get("retrieved_chunks", [])
    if not chunks:
        return {"critic_notes": "No relevant chunks were retrieved from the documents."}
    
    chunks_text = "\n\n".join(
        f"[Chunk {i+1} from '{c['document_title']}']: {c['content']}" for i, c in enumerate(chunks)
    )

    prompt = f"Question: {state['question']}\n\nRetrieved chunks:\n{chunks_text}"

    assessment = await generate(prompt=prompt, system_instruction=CRITIC_SYSTEM_PROMPT)

    return {"critic_notes": assessment.strip()}