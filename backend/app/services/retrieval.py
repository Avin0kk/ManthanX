from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Chunk, Document
from app.services.embeddings import embed_query

async def retrieve_relevant_chunks(db: AsyncSession, query: str, top_k: int = 5) -> list[dict]:
    """
    Embeds the query and finds the top_k most similar chunks in the database
    using cosine distance (smaller distance = more similar).
    """

    query_vector = embed_query(query)

    stmt = (
        select(
            Chunk.id,
            Chunk.content,
            Chunk.chunk_index,
            Chunk.document_id,
            Document.title.label("document_title"),
            Chunk.embedding.cosine_distance(query_vector).label("distance"),
        )
        .join(Document, Chunk.document_id == Document.id)
        .order_by("distance")
        .limit(top_k)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "chunk_id": str(row.id),
            "document_id": str(row.document_id),
            "document_title": row.document_title,
            "chunk_index": row.chunk_index,
            "content": row.content,
            "similarity": 1 - row.distance,
        }
        for row in rows
    ]