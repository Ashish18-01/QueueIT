# AI Evaluation

## Dataset

The evaluation set should be run against a seeded, isolated tenant with expected
facts: shortest waiting queue, joining steps, paused-queue policy, operating
hours, and passport-verification venue. Each case records question, tenant,
expected queue/source, and expected fallback behavior.

## Metrics

| Metric | Current collection | Status |
| --- | --- | --- |
| latency, provider calls, failures, retrieval-result count | in-memory structured telemetry | available per process |
| tool success rate | telemetry expansion planned | unavailable |
| tokens and estimated cost | provider adapter required | unavailable while disabled |
| answer correctness, retrieval relevance, groundedness, hallucination rate | human/fixture review against the dataset | not yet scored |

Scores are intentionally not fabricated. Release evaluation must compare the
validated schema, queue ID, stated wait calculation, and cited knowledge source
to the seeded ground truth. Injection, invalid-output, provider-timeout, and
cross-tenant cases are mandatory negative tests.
