from functools import lru_cache

from google import genai
from app.core.config import settings

@lru_cache(maxsize=1)
def _get_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate(prompt: str, system_instruction: str | None = None) -> str:
    """
    Sends a single prompt to Gemini and returns the plain text response.
    This is the one function every agent will call - keeping it in one place means swapping models or providers later is a one-file change.
    """

    client = _get_client()

    response = client.models.generate_content(
        model=settings.LLM_MODEL,
        contents=prompt,
        config={"system_instruction": system_instruction} if system_instruction else None,
    )

    return response.text