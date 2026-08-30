# Engineering Alignment Matrix

| Requirement | QueueIt capability | Evidence | Status |
| --- | --- | --- | --- |
| LLM applications/prompt engineering | versioned grounded prompt and provider boundary | `backend/src/ai/prompts` | foundation complete |
| RAG, knowledge base, enterprise search | tenant-scoped document/chunk ingestion and retrieval | `/api/v1/ai/knowledge` | baseline complete |
| Vector stores/embeddings | reserved embedding field and replaceable retrieval seam | `KnowledgeChunk` | provider infrastructure pending |
| Multi-agent coordination | fixed supervisor + queue/knowledge/recommendation agents | `AGENT_ARCHITECTURE.md` | controlled baseline complete |
| Structured outputs/guardrails | response schema, RBAC, injection checks, rate limit | `/api/v1/ai/assistant` | complete |
| AI quality/monitoring/cost | telemetry boundary and honest unavailable metrics | `/api/v1/ai/metrics` | partial by design |
| AI-enabled full stack | native React queue planning UI + REST API | `/dashboard/assistant` | complete |
| REST, React, JavaScript, containers, CI/CD | existing production stack retained and documented | Compose and workflow | complete |
| Event-driven architecture | Socket.IO queue events retained; thresholded insight design | `AGENT_ARCHITECTURE.md` | design complete |
| Responsible AI | grounded facts, tenant isolation, human-controlled mutations | `GUARDRAILS.md` | complete |
