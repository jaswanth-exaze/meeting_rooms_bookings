# dotenv Internals

This document explains what `dotenv` is, how it parses `.env` files, and how values end up in `process.env`.

## What Is dotenv
`dotenv` is a small library that loads environment variables from a `.env` file.
It is commonly used in Node.js to keep configuration outside source code.

## Core Behavior
1. Read the `.env` file from disk.
2. Parse each line into a key and value.
3. Add the values to `process.env`.
4. Do not override existing environment variables by default.

## Parsing Algorithm (Conceptual)
1. Read the file into a single string.
2. Split into lines by newline.
3. Ignore empty lines and comments.
4. Split the first `=` into key and value.
5. Trim whitespace around the key.
6. Parse quoted values and escapes.
7. Store the result in a map.

## Whitespace Rules
- Leading and trailing spaces in keys are removed.
- Spaces in unquoted values are preserved as-is.
- Quotes are required to preserve trailing spaces.

## Empty Values
- `KEY=` results in an empty string.
- `KEY` with no equals sign is ignored.

## File Parsing Rules (High-Level)
- Each line is treated as `KEY=VALUE`.
- Lines starting with `#` are comments.
- Blank lines are ignored.
- Whitespace around keys is trimmed.
- Values can be quoted to preserve spaces.

## Line Ending Support
dotenv supports both LF and CRLF line endings.
This makes it portable across Windows, macOS, and Linux.

## Comments After Values
Comments at the end of a line are treated as part of the value unless quoted.
Use quotes to preserve `#` characters.

## Duplicate Keys
If the same key appears multiple times, the last one wins.
This can be useful for overriding earlier values in a file.

## Quoted Values
- Double quotes allow escaped characters like `\n`.
- Single quotes treat content literally.
- Unquoted values are read until the line ends.

## Escaping Rules
- Backslash escapes can be used inside double quotes.
- `\n` represents a newline when parsed.
- `\t` represents a tab when parsed.

## Example Parsing
```
PORT=4000
NAME="Meeting Rooms"
DEBUG=true
```

## Precedence and Override
By default:
- Existing `process.env` values are preserved.
- `.env` values only fill in missing keys.

With `override: true`:
- `.env` values replace existing values.

## Path Resolution
`dotenv.config({ path })` allows you to set a custom path.
Without a custom path, it uses the current working directory.

## Encoding
The file is typically read as UTF-8.
Non-ASCII characters are supported but should be used carefully.

## Unicode and Escapes
Unicode characters are preserved in the parsed values.
Escapes are only processed in double-quoted strings.

## Security Considerations
- `.env` files should never be committed to public repos.
- Secrets should be stored in secure vaults in production.
- `dotenv` is intended primarily for local development.

## Process.env Semantics
- All values in `process.env` are strings.
- Numeric and boolean values must be parsed by the application.
- Missing values are `undefined`.

## Variable Expansion
`dotenv` does not expand variables by default.
If expansion is needed, use a helper like `dotenv-expand`.

## Export Syntax
Some tools allow `export KEY=VALUE` syntax.
dotenv can parse this style when present.

## Error Handling
- If the file is missing, `dotenv` returns a null result.
- Errors can be inspected from the return value.
- The application can decide whether to fail fast.

## Integration Patterns
- Load dotenv at process start.
- Keep a single config module that reads `process.env`.
- Validate and normalize values immediately.
- Export typed config for the rest of the app.

## Edge Cases to Know
- Lines with no `=` are ignored.
- Keys with spaces can cause unexpected parsing.
- Values with `#` should be quoted.
- Empty files result in no changes to `process.env`.

## Line Continuation
dotenv does not support multiline values unless escaped in quotes.
Use `\n` inside double quotes for multi-line content.

## Debugging
You can log `process.env` keys to confirm values are loaded.
Avoid logging secret values in production logs.

## Multiple Files
You can call `dotenv.config` multiple times with different paths.
Later calls can add additional variables.
Use this carefully to avoid confusion about precedence.

## File Permissions
Keep `.env` readable only by the application user.
Avoid world-readable permissions on shared systems.

## CI Guidance
CI pipelines should set environment variables explicitly.
Avoid checking in `.env` files for CI usage.

## Common Pitfalls
- Forgetting to restart the server after `.env` changes.
- Using quotes incorrectly and breaking parsing.
- Relying on implicit type conversion.
- Adding trailing spaces to keys.

## Key Naming Conventions
- Use uppercase keys with underscores.
- Keep names descriptive and stable.
- Avoid dots unless you have tooling that supports them.

## Security Scanning
- Add `.env` to `.gitignore` to avoid commits.
- Use secret scanning to detect leaked keys.
- Rotate secrets if they are exposed.

## Testing Patterns
- Use test-specific env values in CI.
- Validate env values before running tests.
- Avoid hitting production resources from tests.

## Example Return Object
`dotenv.config()` typically returns:
- `parsed`: an object of parsed values.
- `error`: any error that occurred while loading.

## Internal Data Flow
1. Read file contents into a string buffer.
2. Split by newline into lines.
3. Parse each line into key/value.
4. Add parsed keys to `process.env`.

## Production Deployment Patterns
- Prefer environment variables set by the platform.
- Use `.env` only for local development.
- Use per-environment configuration files if needed.

## FAQ
Q: Does dotenv support multiline values?
A: Multiline values can be represented with escaped `\n` in quotes.

Q: Will dotenv override existing env vars?
A: Not unless `override` is explicitly enabled.

Q: Can dotenv load multiple files?
A: You can call `config` multiple times with different paths.

Q: Is dotenv required in production?
A: It is optional if the environment already provides variables.

Q: Does dotenv parse JSON automatically?
A: No, all values are strings until you parse them.

## Glossary
- Environment: A set of key-value variables provided to a process.
- Parser: Code that turns text into structured data.
- Override: Replacing an existing value.
- Expansion: Substituting one variable into another.

## Summary Checklist
- Keep `.env` out of source control.
- Validate required variables at startup.
- Parse numbers and booleans explicitly.
- Restart processes after changes.
