# minilog
Ingest JSON log messages into SQLite for analysis

An extremely simple alternative to Splunk, Logentries, ELK, or grepping.

Pipe your JSON log into ./minilog.  Minilog will populate `./minilog.db` with log entries.

JSON fields recognized:
- `msg`: The primary log message
- `level`: The log level (trace, debug, info, warn, error)
- `time`: The log timestamp (RFC3339 format)
- `context_id`: A unique token usually used to group log messages (usually `request_id` for HTTP requests)
- `context_type`: A unique string for what type of context this message came from (background_job, http_request, ...)
