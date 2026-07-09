from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Chunk, Document
from app.services.chunking import chunk_text
from app.services.embeddings import embed_texts
from app.services.file_parsing import extract_text


async def ingest_document(db: AsyncSession, user_id, filename: str, content: bytes) -> Document:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else "txt"

    text = extract_text(filename, content)
    pieces = chunk_text(text)

    if not pieces:
        raise ValueError("No extractable text found in this document.")

    embeddings = embed_texts(pieces)

    document = Document(title=filename, source_type=ext, user_id=user_id)
    db.add(document)
    await db.flush()  # assigns document.id without committing yet

    for i, (piece, vector) in enumerate(zip(pieces, embeddings)):
        db.add(Chunk(document_id=document.id, chunk_index=i, content=piece, embedding=vector))

    await db.commit()
    await db.refresh(document)
    return document