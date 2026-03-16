# JSON Web Token Internals

This document explains what JWTs are, how they work internally, and how the `jsonwebtoken` library typically signs and verifies tokens.

## What Is a JWT
A JSON Web Token is a compact, URL-safe string that represents claims between two parties.
JWTs are commonly used for authentication and authorization in web APIs.

## JWT Structure
A JWT has three dot-separated parts:
1. Header
2. Payload
3. Signature

The serialized form looks like this:
```
base64url(header).base64url(payload).base64url(signature)
```

## Header Internals
The header is JSON and typically includes:
- `alg`: the signing algorithm, such as `HS256` or `RS256`.
- `typ`: the token type, usually `JWT`.
- Optional fields like `kid` for key identification.

## Payload Internals
The payload is JSON and contains claims.
Claims can be:
- Registered claims like `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`.
- Public claims defined by application conventions.
- Private claims used only within a specific system.

## Signature Internals
The signature is computed from:
- The encoded header.
- The encoded payload.
- A secret or private key, depending on the algorithm.

For HMAC algorithms:
1. Concatenate `base64url(header)` and `base64url(payload)` with a dot.
2. Compute HMAC with the shared secret.
3. Base64url encode the result as the signature.

For RSA or ECDSA algorithms:
1. Use the private key to sign the header and payload.
2. Base64url encode the signature.
3. Verify with the corresponding public key.

## Base64url Details
JWTs use base64url encoding, which is base64 with URL-safe characters:
- `+` becomes `-`
- `/` becomes `_`
- `=` padding is omitted

This makes JWTs safe to pass in URLs and HTTP headers.

## Signing vs Encryption
JWTs are signed, not encrypted by default.
Anyone who has the token can read the payload.
Confidential data should not be stored in the payload unless using JWE (encrypted JWT).

## Validation Workflow
A verifier typically performs these steps:
1. Parse the token into three parts.
2. Base64url decode the header and payload.
3. Ensure the `alg` is allowed by policy.
4. Verify the signature with the correct key.
5. Check standard claims such as `exp`, `nbf`, and `iat`.
6. Check application-specific claims.

## Time-Based Claims
JWTs rely on time checks that can fail if clocks drift.
Important claims include:
- `exp`: expiration time.
- `nbf`: not before time.
- `iat`: issued at time.

Clock skew is usually handled by allowing small leeway during verification.

## Algorithm Selection
Common algorithms:
- `HS256`: HMAC SHA-256 with a shared secret.
- `RS256`: RSA SHA-256 with public/private key pair.
- `ES256`: ECDSA SHA-256 with elliptic curve keys.

Security implications:
- HMAC requires secure shared secrets across all verifiers.
- RSA and ECDSA allow public verification without exposing the private key.

## The `alg=none` Risk
Accepting `alg=none` disables signature verification.
Libraries should reject this algorithm unless explicitly allowed.
Always configure allowed algorithms to avoid confusion attacks.

## The `kid` Header
The `kid` field can indicate which key should be used.
It is useful for key rotation.
It must be validated to avoid key injection or path traversal issues.

## Token Size Considerations
JWTs are sent on every request, often in cookies or headers.
Large payloads increase latency and bandwidth costs.
Keep payloads small and only include necessary claims.

## Token Storage Options
Common storage locations:
- HttpOnly cookies.
- In-memory storage in SPA applications.
- Authorization headers via Bearer tokens.

LocalStorage is convenient but is vulnerable to XSS.
HttpOnly cookies reduce XSS exposure but require CSRF protections.

## Caching and Reuse
JWTs are meant to be reused until expiry.
Short lifetimes reduce risk if a token is leaked.
Long lifetimes reduce login frequency but increase risk.

## Typical jsonwebtoken API Surface
Common operations:
- `sign(payload, secretOrPrivateKey, options)`
- `verify(token, secretOrPublicKey, options)`
- `decode(token, options)`

The library handles base64url encoding and signature creation internally.

## Example Header and Payload
Header:
```json
{ "alg": "HS256", "typ": "JWT" }
```

Payload:
```json
{ "sub": "123", "name": "Alice", "iat": 1710000000, "exp": 1710007200 }
```

## Example Token Construction (Conceptual)
1. Serialize header and payload to JSON.
2. Base64url encode the JSON strings.
3. Compute signature over `header.payload`.
4. Join the three parts with dots.

## Example Verification Failure Modes
- Signature does not match.
- Token expired based on `exp`.
- Token not valid yet based on `nbf`.
- `aud` does not match expected audience.
- `iss` does not match expected issuer.

## Security Pitfalls
- Using a weak secret with HMAC.
- Accepting tokens with missing or unexpected `alg`.
- Failing to validate `aud` and `iss` in multi-service setups.
- Storing sensitive data in the payload.
- Using long-lived tokens without rotation.

## Operational Guidance
- Rotate keys regularly.
- Keep signing keys out of source control.
- Use environment-specific secrets.
- Monitor for auth errors and token rejections.

## Advanced Validation Strategies
- Validate `iss` to ensure the token comes from your issuer.
- Validate `aud` to ensure the token is intended for your API.
- Validate `sub` to map the token to a known subject.
- Enforce a maximum token age using `iat`.
- Enforce acceptable clock skew with leeway settings.

## Revocation and Session Control
- JWTs are stateless, so revocation requires extra storage.
- A denylist can store revoked token identifiers (`jti`).
- A short expiration can reduce the need for explicit revocation.
- A token version stored in the user record can invalidate old tokens.
- Logout typically clears cookies but does not revoke JWTs.

## Key Rotation Patterns
- Use a `kid` header to select the active key.
- Keep old keys available for a grace period.
- Rotate keys on a predictable schedule.
- Remove old keys after all tokens signed with them expire.

## Access vs Refresh Tokens
- Access tokens are short-lived and used on every request.
- Refresh tokens are long-lived and used only to get new access tokens.
- Refresh tokens should be stored with stronger protection.
- This project uses a single access token only.

## FAQ
Q: Are JWTs encrypted?
A: No, JWTs are only signed unless you use JWE.

Q: Can I revoke a JWT?
A: Not without a revocation list or short expiration.

Q: Why not store session IDs instead?
A: Sessions require server-side storage, JWTs can be stateless.

Q: Do JWTs prevent CSRF?
A: Not by themselves, CSRF still applies with cookies.

Q: Can I trust the payload?
A: Only after verifying the signature and claims.

## Glossary
- JWT: JSON Web Token.
- JWS: JSON Web Signature.
- JWE: JSON Web Encryption.
- Claim: A statement about a subject.
- Subject: The principal the token is about.
- Issuer: The system that issued the token.
- Audience: The intended recipients of the token.
- Signature: The cryptographic proof of authenticity.
- HMAC: Hash-based Message Authentication Code.
- Base64url: URL-safe base64 encoding.

## Summary Checklist
- Always verify the signature.
- Always validate time-based claims.
- Keep secrets long and random.
- Keep payloads small.
- Rotate keys intentionally.
- Avoid storing PII in tokens.
