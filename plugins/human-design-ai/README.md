# HumanDesign.ai plugin

Universal ChatGPT/Codex and Claude Code package for the official HumanDesign.ai MCP, backed by the same validated, versioned calculation service that powers HumanDesign.ai and including primary-chart creation, saved composite access, and deterministic bodygraph rendering.

- MCP: `https://mcp.humandesign.ai/`
- Authentication: HumanDesign.ai OAuth 2.1 for the bundled account connection; the remote server also accepts protected API keys for its separate six-tool calculation surface
- Documentation: https://humandesignmcp.com/docs/plugins
- Privacy: https://humandesignmcp.com/privacy
- Terms: https://humandesignmcp.com/terms

The package contains both `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json`. Both use the same remote MCP connection and membership-aware workflow skill.

Consuming API-key MCP tools require a stable `idempotencyKey`, allowing the same intended calculation to be retried without an additional quota debit. Matching retries may deterministically recompute and are not byte-for-byte stored-response replay.

Send the birth date and time as it read on the clock where the person was born, with no `Z` and no UTC offset, and give the timezone separately as an IANA identifier. For example, `1990-05-15T14:30:00` with `America/New_York` means half past two in the afternoon in New York. Never convert a birth time to UTC before sending it; a wall clock time that a daylight-saving change skipped or repeated is refused before any calculation unit is used.
