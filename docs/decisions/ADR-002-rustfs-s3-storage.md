# ADR-002: RustFS (S3-compatible) for File Storage

## Status
Accepted

## Context

The application needs to store large binary files (PDF, video, audio up to 100 MB) with an API that supports upload, download (streaming), presigned URLs, and delete. In a learning/development environment, we need S3-compatible object storage without incurring AWS costs or requiring real AWS credentials.

The chosen storage solution must integrate with the AWS S3 SDK v3 (already a well-established standard), run locally in Docker, and be replaceable with real S3 for production without code changes.

## Decision

We use RustFS — a Rust-based, S3-compatible object storage server — running in Docker on port 10000. The S3 client in `lib/s3.ts` uses `@aws-sdk/client-s3` with `forcePathStyle: true` (required by RustFS) and the endpoint read from `AWS_URL` env var. Switching to real AWS S3 only requires updating environment variables.

## Consequences

**Positive:**
- Zero cloud cost for local development and learning.
- Full S3 API compatibility — the application code is identical for RustFS and real S3.
- `forcePathStyle: true` in `lib/s3.ts` (line 19) is the only RustFS-specific configuration.
- Docker-based — easy to spin up and tear down.

**Negative:**
- No production SLA, replication, or built-in redundancy.
- Requires Docker to be running in the development environment.
- RustFS is less battle-tested than MinIO or AWS S3 at scale.
- If the RustFS container stops, all uploads fail with no fallback.

## Alternatives Considered

**AWS S3 (managed)** — Production-grade with global CDN, versioning, and SLA. Rejected for development because it requires real AWS credentials and incurs per-request costs — not appropriate for a learning project.

**MinIO** — Go-based, mature, widely used S3-compatible server. Rejected because RustFS is lighter and sufficient for the project's needs; MinIO's additional features (multi-tenant, tiering) are not required here.

**Local filesystem** — Simplest option. Rejected because it would require a completely different client interface and wouldn't validate S3 SDK integration, which is the actual production path.
