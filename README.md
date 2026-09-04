# HumanDesign.ai MCP

The official HumanDesign.ai MCP server, for use with Claude, ChatGPT, Codex, Cursor and VS Code, backed by the same validated, versioned calculation service that powers HumanDesign.ai.

HumanDesign.ai MCP gives an AI assistant structured chart data, deterministic bodygraph graphics, and authorized account workflows without asking a language model to approximate chart mathematics. It uses secure HumanDesign.ai OAuth and filters every tool by the signed-in account, selected workspace, role, membership, ownership, server-derived capability grants, and entitlements. New calculations are delegated to the same birth-input, timezone, calculation, and quota authority used by HumanDesign.ai.

## Connect

Remote Streamable HTTP endpoint:

```text
https://mcp.humandesign.ai/
```

Health endpoint:

```text
https://mcp.humandesign.ai/health
```

### Claude Code plugin

```bash
claude plugin marketplace add humandesignai/human-design-ai-mcp
claude plugin install human-design-ai@human-design-ai
```

Start an interactive Claude Code session, open `/mcp`, and complete the HumanDesign.ai browser login. Claude Code itself must be signed in first; run `/login` if it says `Not logged in`.

You can also connect the server directly:

```bash
claude mcp add --transport http --scope user human-design-ai https://mcp.humandesign.ai/
```

Then use `/mcp` to authenticate.

### ChatGPT

During development or private testing:

1. In ChatGPT, open **Settings → Security and login** and enable **Developer mode**.
2. Open **Plugins**, select the plus button, and add `https://mcp.humandesign.ai/`.
3. Complete HumanDesign.ai OAuth and select the account or workspace the assistant should work inside.

If you do not yet have a HumanDesign.ai account, the authorization flow offers **Create your account** and takes you through the normal free-account chart onboarding. After finishing onboarding, return to the client and start the connection once more; automatic return to the original OAuth request is not yet supported.

This repository also contains the universal `.codex-plugin/plugin.json` package used for ChatGPT/Codex plugin submission.

The MCP can be tested in Developer Mode today. This repository does not claim that the MCP is listed in or approved by any ChatGPT, Codex, or Claude directory unless and until that directory has reviewed and published it.

### Codex

The plugin contains the same MCP server and skill guidance used by ChatGPT. For a direct MCP connection:

```toml
[mcp_servers.human_design_ai]
url = "https://mcp.humandesign.ai/"
auth = "oauth"
startup_timeout_sec = 30
tool_timeout_sec = 60
```

### API-key calculation connection

API-key connections expose only the calculation and reference surface. Send the key as either an `Authorization: Bearer` header or an `X-Api-Key` header, and keep it in the client's secret or environment-variable store rather than a project file, URL, or chat message.

| API tier | Calculation tools returned by `tools/list` |
|---|---|
| API Free or Creator | `resolve_timezone`, `generate_chart`, `generate_composite_chart`, `get_reference_item` |
| Startup | The four above, plus `get_transits` |
| Business | The five above, plus `search_celebrities` |

These API tiers are separate from HumanDesign.ai platform memberships. Protocol discovery calls such as initialize, ping, and `tools/list` are free; a calculation-tool result reports its own quota effect.

For MCP calls, `generate_chart`, `generate_composite_chart`, and `get_transits` require a stable `idempotencyKey`; keyed transit calls also require an explicit `date` so a retry cannot silently move to a different moment. Reuse the same key with the same normalized arguments when retrying one intended calculation and create a new key for new work. A matching retry consumes no additional quota and may deterministically recompute the result; it is not a byte-for-byte replay of a stored response. Direct REST and Agent HTTP clients can send the equivalent `Idempotency-Key` header on supported bounded non-streaming operations. During the compatibility rollout that header is recommended rather than mandatory; a request without it remains atomic but cannot deduplicate a transport retry. Batch and SSE reject caller retry keys and are outside this retry-deduplication contract.

## Membership access

| Membership | MCP experience |
|---|---|
| Free | Generate, view, and render your own primary chart. |
| Individual | Your own primary chart plus account usage information. This membership uses the internal identifier `solo`. |
| Personal | The minimum membership for wider authorized chart and saved-composite access, the wider library, and reports already owned. |
| Pro | Personal capabilities plus entitled professional workspaces. |

Website Builder tools appear only when HumanDesign.ai has enabled the Builder for your account, and only when `tools/list` advertises them.

Selecting a workspace does not grant new permissions. It chooses the account boundary for the connection. Membership, role, ownership, and entitlement checks still apply to every tool call. An authorized Builder boundary covers eligible projects underneath it.

HumanDesign.ai itself offers experiences beyond this MCP release, including deeper chart context, professionals, community learning, and people exploring similar design patterns. The MCP does not currently expose community actions. The calculation tool `get_transits` is controlled by the separate API tier and begins at API Startup, rather than being granted by a platform membership.

## Birth date and time

Send the birth date and time as it read on the clock where the person was born, with no `Z` and no UTC offset, and give the timezone separately as an IANA identifier. For example, `"birthDateTime": "1990-05-15T14:30:00"` with `"timezone": "America/New_York"` means half past two in the afternoon in New York. Never convert a birth time to UTC before sending it, and never append `Z` to make a value look like ISO 8601. Values carrying `Z` or a numeric offset are deprecated: they are still accepted for now, read as UTC, and the API flags the deprecation on its response.

A wall clock time that names no single moment is refused before any calculation unit is used: `nonexistent_local_time` when a daylight-saving change skipped it, `ambiguous_local_time` when a daylight-saving fold repeated it, and `future_birth_datetime` when the birth is in the future. Ask the person to confirm the intended clock time rather than guessing one. Transit dates use the same wall clock format but may be in the future.

## Composite charts

The API-key calculation surface can generate a new composite from two sets of birth details. An OAuth-connected account can retrieve an authorized saved composite from the library and render it as PNG or SVG when the live tool list permits it.

Composite charts are designed for exploring relationship dynamics between two charts. Generating a new composite through an API key uses the calculation quota reported by the server. Retrieving or rendering an existing OAuth-authorized saved composite is free unless the returned billing envelope says otherwise.

## Chart images

Ask: **“Show my Human Design chart as a PNG.”** The assistant should resolve the account's primary chart directly, rather than search by your name. The MCP returns an inline image plus a short-lived download link for clients that do not display image blocks.

## Safety and billing

- API keys remain calculation-only; account-connected tools use OAuth.
- Discovery and permitted reads are free unless a result explicitly states otherwise.
- Existing-chart rendering is free; calculating and rendering a new chart uses one normal calculation unit.
- Existing-composite rendering follows the same image fallback: inline PNG where supported, plus a short-lived download link.
- Account-connected consequential actions use previews and confirmation when the live tool advertises that workflow; high-risk external effects use a secure HumanDesign.ai handoff. API-key calculations execute directly and use the quota/idempotency contract above.
- The MCP never asks users to paste passwords, OAuth tokens, refresh tokens, API keys, or integration secrets into chat.

## Repository contents

- `plugins/human-design-ai/` — Claude and ChatGPT/Codex plugin package
- `.claude-plugin/marketplace.json` — Claude Code marketplace catalog
- `.agents/plugins/marketplace.json` — ChatGPT/Codex authoring marketplace
- `SUBMISSION.md` — directory-ready copy and listing metadata
- `chatgpt-app-submission.json` — review draft with source-checked tool hints and test cases
- `llms.txt` — concise machine-readable product and connection summary

## Links

- Documentation: https://humandesignmcp.com
- HumanDesign.ai: https://humandesign.ai
- Privacy: https://humandesignmcp.com/privacy
- Terms: https://humandesignmcp.com/terms
- Support: https://humandesignmcp.com/faq

## License

MIT. The HumanDesign.ai name, logo, and brand assets remain trademarks of their respective owner.
