import asyncio
from functools import lru_cache

from google import genai
from google.genai.errors import ClientError, ServerError

from app.core.config import settings

@lru_cache(maxsize=1)
def _get_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate(prompt: str, system_instruction: str | None = None, _retry_count: int = 0) -> str:
    """
    Sends a single prompt to Gemini and returns the plain text response.
    This is the one function every agent will call - keeping it in one place means swapping models or providers later is a one-file change.
    """

    client = _get_client()

    try:
        response = client.models.generate_content(
            model=settings.LLM_MODEL,
            contents=prompt,
            config={"system_instruction": system_instruction} if system_instruction else None,
        )
    except ClientError as e:
        if e.code == 429 and _retry_count < 2:
            await asyncio.sleep(15)
            return await generate(prompt, system_instruction, _retry_count + 1)
        if e.code == 429:
            return "I'm getting a lot of requests right now - please wait about a minute and try again."
        raise
    except ServerError:
        if _retry_count < 2:
            await asyncio.sleep(5)
            return await generate(prompt, system_instruction, _retry_count + 1)
        return "Gemini is experiencing high demand right now - please try again in a moment."

    return response.text