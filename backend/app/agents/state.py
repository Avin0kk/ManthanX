from typing import TypedDict

class AgentState(TypedDict):
    question: str
    route: str
    retrieved_chunks: list[dict]
    critic_notes: str
    final_answer: str