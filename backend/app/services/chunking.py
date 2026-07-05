def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> list[str]:
    """
    Splits text into overlapping chunks, trying to break on paragraph/sentence
    boundaries before falling back to a hard character cut.

    chunk_size and overlap are in characters, not tokens - simple and good enough
    for a resume project. Swap for a tiktoken-based token counter if you want
    exact LLM context budgeting later.
    """
    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    separators = ["\n\n", "\n", ". ", " "]
    chunks: list[str] = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        if end < len(text):
            best_break = -1
            window = text[start:end]
            for sep in separators:
                idx = window.rfind(sep)
                if idx != -1:
                    best_break = idx + len(sep)
                    break
            if best_break != -1 and best_break > chunk_size * 0.5:
                end = start + best_break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - overlap if end - overlap > start else end

    return chunks