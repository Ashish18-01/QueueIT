# Technology Decisions

| Technology | Why chosen | Pros | Cons | Alternatives |
| --- | --- | --- | --- | --- |
| React | Mature component model for interactive queue and dashboard experiences. | Ecosystem, hiring pool, reusable UI patterns. | Requires state discipline. | Vue, Angular, Svelte. |
| Next.js | Supports SSR/SSG, routing, optimized assets, and deployment flexibility. | Performance, SEO, developer productivity. | Framework conventions and upgrade churn. | Vite SPA, Remix. |
| Node.js | TypeScript end-to-end and strong I/O performance. | Shared language, broad packages. | CPU-heavy work needs workers or separate services. | .NET, Java, Go. |
| NestJS | Enforces modular backend architecture and DI. | Testability, structure, decorators, guards. | More abstraction than Express. | Express, Fastify, Spring Boot. |
| Express/Fastify adapter | HTTP transport under NestJS. | Proven request handling. | Not the domain architecture itself. | Native Node HTTP. |
| PostgreSQL | Primary relational store. | ACID, indexes, JSONB, reporting. | Write sharding complexity. | MySQL, MongoDB, DynamoDB. |
| Redis | Cache, locks, rate limits, ephemeral status. | Very fast, simple primitives. | Volatile if misused as source of truth. | Memcached, database cache. |
| Message Queue | Decouples notifications and background jobs. | Retries, resilience, throughput smoothing. | Operational component to manage. | Inline side effects, cron polling only. |
| Docker | Portable immutable runtime. | Reproducible deployment. | Image security and orchestration needs. | VMs, serverless packages. |
| GitHub Actions | CI/CD close to repository. | Integrated automation, marketplace. | Vendor coupling. | GitLab CI, CircleCI, Azure DevOps. |
| AWS | Broad managed services and global scale. | RDS, ElastiCache, ECS/EKS, S3, CloudFront. | Cost and complexity. | Azure, GCP, Fly.io, Render. |
| Cloudflare | CDN, DNS, WAF, edge protections. | Fast global edge, security controls. | Another vendor dependency. | AWS CloudFront, Fastly. |

## Decision Analysis

Technology choices prioritize reliability, team productivity, managed infrastructure, and portability. The design intentionally avoids depending on provider-specific business logic so future migrations remain possible.
