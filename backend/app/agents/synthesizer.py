from app.agents.state import AgentState
from app.services.llm import generate

SYNTHESIZER_SYSTEM_PROMPT = """You are the final answer-writing agent in a document Q&A system.
You will be given a user's question, retrieved chunks from their documents
(if any), and a critic's assessment of those chunks.

Write a clear, direct answer to the question.

Rules:
- If retrieved chunks are relevant, base your answer on them and mention
  which document(s) the information came from.
- If the critic flagged the chunks as insufficient or irrelevant, say so
  honestly instead of guessing - do not make up information that isn't
  supported by the retrieved content.
- If no retrieval was needed (a direct/general question), just answer
  naturally and helpfully.
- Keep the answer concise and well-organized."""

async def synthesizer_node(state: AgentState) -> dict:
    chunks = state.get("retrieved_chunks", [])

    if chunks:
        chunks_text = "\n\n".join(
            f"[Source: {c['document_title']}]: {c['content']}" for c in chunks
        )
    else:
        chunks_text = "(no chunks retrieved)"

    prompt = (
        f"Conversation so far:\n{state.get('history', '(no prior messages)')}\n\n"
        f"Question: {state['question']}\n\n"
        f"Retrieved content:\n{chunks_text}\n\n"
        f"Critic's assessment: {state.get('critic_notes', 'N/A')}"
    )

    answer = await generate(prompt=prompt, system_instruction=SYNTHESIZER_SYSTEM_PROMPT)
    return {"final_answer": answer.strip()}