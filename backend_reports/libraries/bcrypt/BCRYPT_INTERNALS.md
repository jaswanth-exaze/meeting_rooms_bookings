# Bcrypt Internals and Hash Generation

This document explains what bcrypt is, how it works internally at a high level, and how hashes are generated and verified.

## What Is Bcrypt
Bcrypt is an adaptive password hashing algorithm based on the Blowfish cipher. It is designed to be slow and expensive to compute so that brute-force attacks are harder. The algorithm includes a configurable cost factor that increases the work exponentially.

## Why Bcrypt Is Used for Passwords
- It is intentionally slow, which makes large-scale guessing costly.
- It includes a per-password random salt to prevent rainbow-table attacks.
- The cost factor can be increased over time as hardware gets faster.

## Bcrypt Hash Format
A standard bcrypt hash string looks like this:
```
$2b$12$y4C2bKQ1wS4S6g4Y8m5xjOe0aUuJw1D6vGQhVw6q3gY6B7lTnE3fy
```
Parts:
1. `$2b$` is the version marker (other common markers are `$2a$` and `$2y$`).
2. `12` is the cost factor, representing 2^12 key setup iterations.
3. The next 22 characters are the salt (bcrypt base64 encoding).
4. The remaining 31 characters are the hash output (bcrypt base64 encoding).

## How Bcrypt Works Internally (High-Level)
Bcrypt is built on Blowfish and uses an enhanced key schedule known as EksBlowfish. The password and salt are repeatedly mixed into the Blowfish state.

Core idea:
1. Initialize the Blowfish state.
2. Expand the state with the salt and password.
3. Repeat expansion 2^cost times (this is what makes bcrypt slow).
4. Encrypt a fixed 24-byte constant with the resulting state.
5. Encode the result along with the salt and cost into the bcrypt hash string.

This design makes each hash computation expensive and ensures the salt is unique per password.

## How Hash Generation Works (Conceptual Steps)
1. Choose a cost factor (for example, 12).
2. Generate a 128-bit random salt.
3. Run EksBlowfish key setup with password and salt for 2^cost iterations.
4. Encrypt a fixed 24-byte string with the final Blowfish state.
5. Encode the salt and ciphertext using bcrypt's base64 variant.
6. Assemble the final hash string: `$version$cost$salt+hash`.

## How Verification Works
1. Parse the stored hash to extract the version, cost, and salt.
2. Run bcrypt again with the provided password and the extracted parameters.
3. Compare the newly computed hash to the stored hash in constant time.

If they match, the password is valid. The salt and cost are embedded in the stored hash, so verification does not require separate storage.

## Cost Factor Details
- The cost factor is an exponent. A cost of 12 means 2^12 iterations.
- Increasing cost by 1 roughly doubles the work.
- Higher cost increases security but also increases CPU usage and latency.

## Bcrypt Base64 Notes
Bcrypt uses a custom base64 alphabet that differs from standard base64. This is why bcrypt hashes do not look like typical base64 output.

## Practical Guidance
- Do not use bcrypt for general data encryption; it is for password hashing.
- Keep cost factor high enough to slow attackers but acceptable for login latency.
- Use a per-password random salt for every hash.
- Consider adding a server-side pepper if your threat model calls for it.

## Where This Repo Uses Bcrypt
- `backend/src/utils/password.js` for hashing and verification.
- `backend/src/controllers/auth.controller.js` for login and password changes.
- `backend/test/password.test.js` for password tests.
