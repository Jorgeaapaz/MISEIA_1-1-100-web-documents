# ADR-003: HMAC-SHA256 HTTP-only Cookies over JWT

## Status
Accepted

## Context

The application requires session authentication for a Next.js full-stack app: users log in and subsequent requests must identify the authenticated user. The session must:
- Be revocable (e.g., on logout or security incident)
- Not require a database lookup on every request
- Be secure against XSS (HttpOnly cookie) and CSRF (SameSite=Lax)
- Avoid adding external library dependencies for signing

## Decision

We use custom HMAC-SHA256 signed HTTP-only cookies implemented in `lib/auth.ts`. The session payload `{ userId, exp }` is base64-encoded and signed with `SESSION_SECRET` using the native Web Crypto API (`crypto.subtle.importKey` + `crypto.subtle.sign`). The resulting token `base64payload.hmac_signature` is stored in an HttpOnly cookie with a 7-day TTL.

No `jsonwebtoken` or similar library is used — the signing uses the platform-native `crypto.subtle` API available in Node.js 18+.

## Consequences

**Positive:**
- No external library dependency for signing (uses `crypto.subtle` from Node.js built-ins).
- Sessions can be invalidated globally by rotating `SESSION_SECRET`.
- HttpOnly + SameSite=Lax protects against XSS and most CSRF vectors.
- Custom implementation is transparent — the sign/verify logic is visible in ~20 lines at the bottom of `lib/auth.ts`.

**Negative:**
- Revoking a single session (e.g., one device) requires storing a session denylist in the database — currently not implemented.
- Custom implementation requires maintenance if the signing requirements change.
- The `exp` field is checked by the application, not enforced at the cookie level (cookie `maxAge` is set as a secondary guard).
- Not interoperable with third-party services that expect standard JWT tokens.

## Alternatives Considered

**JWT with `jsonwebtoken` library** — Standard, widely understood, ecosystem support. Rejected because: (1) adds a library dependency for functionality already in Node.js built-ins; (2) stateless JWT cannot be revoked without a database denylist, negating the stateless benefit; (3) overkill for a single-service session.

**Session ID stored in database (server-side sessions)** — Full revocability of individual sessions. Rejected because it requires a database lookup on every authenticated request — adds latency and couples the session check to MongoDB availability.

**NextAuth.js** — Full-featured auth library for Next.js. Rejected because: (1) this project explicitly avoids `middleware.tsx` per `AGENTS.md`; (2) NextAuth adds significant complexity and configuration overhead for a single provider (email/password); (3) it obscures the auth implementation, which is a learning objective.
