from app.services.llm import generate

SUMMARY_SYSTEM_PROMPT = """You are a document summarization agent.
You will be given the first several chunks of a document's text.
Write a concise summary (3-5 sentences) capturing what this document is,
its key topics, and any especially notable details (like names, projects,
or figures, if it's a resume or report).

Write only the summary itself - no preamble like "This document is about"."""


async def generate_summary(chunks_text: str) -> str:
    summary = await generate(prompt=chunks_text, system_instruction=SUMMARY_SYSTEM_PROMPT)
    return summary.strip()