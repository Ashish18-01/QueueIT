# Knowledge Base and Retrieval Architecture

Organization administrators ingest text documents through `POST /api/v1/ai/knowledge`.
The service creates a `KnowledgeDocument`, splits content into bounded
`KnowledgeChunk` records, and stores source and tenant metadata. Retrieval
filters by `organizationId` before scoring, so chunks from another organization
cannot enter the assistant context.

The initial adapter is deterministic lexical retrieval to avoid claiming vector
semantics without a configured embedding provider. `KnowledgeChunk.embedding`
is intentionally reserved for future generated vectors. When MongoDB Atlas
Vector Search (or another approved vector store) is provisioned, an embedding
adapter can populate that field and replace only the retrieval implementation;
the ingestion, authorization, source citations, and assistant contract stay
unchanged.

Metadata includes organization, branch, venue, queue, document, source, and
chunk identifiers. Missing evidence produces the explicit verified-information
fallback rather than an invented policy.
