from functools import lru_cache

from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts. Returns one 384-dim vector per input string."""
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return vectors.tolist()

def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]