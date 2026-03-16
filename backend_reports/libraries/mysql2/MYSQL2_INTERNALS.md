# MySQL2 Internals

This document explains what the `mysql2` library is, how it works internally at a high level, and how queries are executed.

## What Is mysql2
`mysql2` is a Node.js driver for MySQL that supports both callback and promise APIs.
It implements the MySQL client protocol and provides features such as prepared statements and connection pooling.

## Core Components
- Connection: a single TCP connection to the MySQL server.
- Pool: a manager that hands out reusable connections.
- Query: a SQL statement executed by the server.
- Prepared statement: a SQL statement with bound parameters.

## Client Protocol (High-Level)
When a client connects to MySQL:
1. The server sends a greeting with capability flags.
2. The client responds with authentication data.
3. The server validates credentials and completes the handshake.

After handshake, the client can send query packets to the server.

## Packet Types (Conceptual)
- Handshake packets establish capabilities.
- Auth packets carry credentials or auth response data.
- Query packets carry SQL statements.
- Result packets carry column definitions and row data.
- Error packets carry error codes and messages.

## Connection Pool Behavior
Pools manage concurrency by reusing connections:
- If a connection is free, it is reused.
- If all connections are busy, requests wait in a queue.
- `connectionLimit` controls max concurrent connections.
- `waitForConnections` controls whether to queue or error.

## Query Execution Flow
1. Client sends a query packet with SQL and parameters.
2. Server parses and optimizes the query.
3. Server executes against the storage engine.
4. Server sends result set packets back to the client.
5. The client parses results into rows and metadata.

## Prepared Statements Internals
Prepared statements split SQL parsing from execution:
1. The SQL is prepared with placeholders.
2. The server creates a statement ID.
3. Each execution sends only the parameters.
4. This reduces repeated parsing and helps prevent injection.

## Parameter Binding Details
- Placeholders are represented as `?` in SQL.
- Values are sent separately from SQL text.
- The server performs type conversion based on column metadata.
- Null values are sent explicitly as NULL.

## `query` vs `execute`
mysql2 exposes two main methods:
- `query`: sends SQL with interpolation handled by the client.
- `execute`: uses prepared statements with bound parameters.

`execute` is safer for user input and is used in this project.

## Result Shapes
Result sets include:
- Row data as arrays or objects.
- Field metadata describing column names and types.

Write operations return:
- `affectedRows`
- `insertId`
- `warningStatus`

## Type Casting and Field Parsing
- Numeric fields can be returned as numbers or strings.
- Date and time fields can be returned as JS Date objects or strings.
- The driver can be configured to control casting behavior.

## Transactions
Transactions allow multiple queries to be committed atomically:
1. `BEGIN` starts a transaction.
2. Multiple queries execute.
3. `COMMIT` persists all changes.
4. `ROLLBACK` reverts all changes on error.

## Isolation Levels
- READ UNCOMMITTED allows dirty reads.
- READ COMMITTED avoids dirty reads.
- REPEATABLE READ is MySQL default for InnoDB.
- SERIALIZABLE provides the strongest isolation.

## Error Handling
mysql2 surfaces MySQL errors with codes such as:
- `ER_ACCESS_DENIED_ERROR`
- `ER_BAD_DB_ERROR`
- `ER_BAD_FIELD_ERROR`
- `ER_PARSE_ERROR`

Errors can be handled per query or globally by application logic.

## Timezone Handling
MySQL stores timestamps without timezone by default.
Drivers can map times to local or UTC based on configuration.
Using UTC reduces ambiguity across environments.

## Character Sets and Collations
- Character set controls how strings are encoded.
- Collation controls sorting and comparison rules.
- Mismatched encodings can cause garbled text.
- Define UTF-8 settings consistently across DB and client.

## Streaming Results
- Streaming allows row-by-row processing for large result sets.
- It reduces memory pressure for huge queries.
- This project does not use streaming, but mysql2 supports it.

## Performance Considerations
- Connection pooling reduces overhead of repeated handshakes.
- Prepared statements reduce server parsing cost.
- Indexes reduce row scans for large tables.
- Network latency can dominate for small queries.

## Security Considerations
- Always use parameterized queries.
- Use least-privilege DB users.
- Avoid logging raw SQL with sensitive data.
- Rotate DB credentials periodically.

## Example Query Lifecycle (Conceptual)
1. Application calls `execute("SELECT * FROM employee WHERE id = ?", [id])`.
2. mysql2 sends the query and parameters to the server.
3. MySQL uses indexes to locate matching rows.
4. The result set is returned and parsed into JavaScript objects.

## Common Pitfalls
- Forgetting to release connections when using manual connection objects.
- Using string concatenation for user input.
- Not handling connection errors on startup.
- Using too small or too large pool sizes.

## Connection Lifecycle Notes
- Connections can be dropped by the server due to timeouts.
- Pools must detect and replace dead connections.
- Long idle times can cause server-side disconnects.

## Interactions With Node.js Event Loop
- mysql2 uses asynchronous I/O under the hood.
- Results are delivered via promises or callbacks.
- Long-running queries can still cause request latency.

## Security and TLS
- mysql2 can connect using TLS if configured.
- TLS protects credentials and data over the network.
- Certificates should be rotated according to policy.

## Locking and Deadlocks
- Writes can acquire row or table locks.
- Concurrent writes can cause deadlocks.
- MySQL detects deadlocks and aborts one transaction.
- Applications should retry safe operations after deadlocks.

## Query Planning
- MySQL builds an execution plan for each query.
- Indexes influence the plan and performance.
- EXPLAIN can be used to inspect query plans.

## Configuration Options Worth Knowing
- `host`, `port`, `user`, `password`, `database`.
- `connectionLimit`, `queueLimit`, `waitForConnections`.
- `timezone` and `dateStrings` for time handling.
- `multipleStatements` for multi-query execution.

## Timeouts and Keepalive
- Connect timeouts prevent hanging on unreachable hosts.
- Query timeouts prevent long-running statements.
- TCP keepalive helps detect dead connections.

## Retry and Backpressure Strategies
- Retry only idempotent queries on transient errors.
- Apply timeouts to prevent hung requests.
- Use circuit breakers to reduce load on a failing DB.

## Buffering and Memory Use
- Large result sets consume memory if fully buffered.
- Streaming can reduce memory usage for large exports.
- Batch processing reduces peak memory usage.

## Compression
- MySQL can use compressed connections in some setups.
- Compression reduces bandwidth but adds CPU cost.
- It is typically unnecessary for local networks.

## FAQ
Q: Does mysql2 support MySQL 8 authentication?
A: Yes, when configured correctly for the server.

Q: Is mysql2 faster than mysql?
A: It is generally faster and supports modern features.

Q: Do I need prepared statements for all queries?
A: Yes for user input, optional for static SQL.

Q: Can I use transactions with the pool?
A: Yes, by acquiring a connection and managing it.

Q: Can I stream large result sets?
A: mysql2 supports streaming but it is not used here.

## Glossary
- Handshake: Initial authentication exchange.
- Pool: A reusable connection manager.
- Statement ID: Identifier for a prepared statement.
- Result Set: Rows returned by a query.
- Metadata: Column information returned with results.
- Transaction: A set of queries that succeed or fail together.

## Summary Checklist
- Use `execute` with bound parameters.
- Keep pool settings tuned to DB capacity.
- Handle connection errors during startup.
- Use UTC for timestamps.
- Avoid query patterns that create N+1 queries.
