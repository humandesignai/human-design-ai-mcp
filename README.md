# HumanDesign.ai MCP

The official, account-connected Human Design MCP for Claude, ChatGPT, and Codex.

HumanDesign.ai MCP lets an AI assistant generate and render individual and composite Human Design charts, explore authorized chart and library data, review account usage and reports, and work with entitled HumanDesign.ai Website Builder projects. It uses secure HumanDesign.ai OAuth and filters every tool by the signed-in account, selected workspace, role, membership, ownership, scopes, and entitlements.

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
claude plugin marketplace add kylehi2222/human-design-ai-mcp
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
3. Complete HumanDesign.ai OAuth and select the Personal account or workspace the assistant should work inside.

If you do not yet have a HumanDesign.ai account, the authorization flow offers **Create your account** and takes you through the normal free-account chart onboarding. After finishing onboarding, return to the client and start the connection once more; automatic return to the original OAuth request is not yet supported.

This repository also contains the universal `.codex-plugin/plugin.json` package used for ChatGPT/Codex plugin submission.

### Codex

The plugin contains the same MCP server and skill guidance used by ChatGPT. For a direct MCP connection:

```toml
[mcp_servers.human_design_ai]
url = "https://mcp.humandesign.ai/"
auth = "oauth"
startup_timeout_sec = 30
tool_timeout_sec = 60
```

## Membership access

| Membership | MCP experience |
|---|---|
| Free | Generate, view, and render your own primary chart. |
| Personal | The recommended next step for composite relationship charts, other authorized charts, the wider library, reports, transits, and the HumanDesign.ai community of professionals and people exploring similar designs. Exact tools remain entitlement-driven. |
| Pro | The fullest professional experience: Personal capabilities plus entitled workspaces and Website Builder workflows; a separate Builder entitlement may also qualify. |

Selecting a workspace does not grant new permissions. It chooses the account boundary for the connection. Membership, role, ownership, and entitlement checks still apply to every tool call, and an authorized Builder boundary covers eligible projects underneath it.

Personal and Pro are designed for people who want Human Design to be an ongoing practice rather than a one-off chart: follow transits, explore more chart context, learn alongside professionals, connect with people who have similar design patterns, and bring that insight into reports or an entitled professional workflow.

## Composite charts

Ask: **“Create a composite chart for these two people and show me the relationship bodygraph.”** The MCP can generate a composite from two sets of birth details, retrieve an authorized saved composite from the library, and render the composite as PNG or SVG when the connected plan and live tool list permit it.

Composite charts are designed for exploring relationship dynamics between two charts. Generating a new composite uses the calculation quota reported by the server. Retrieving or rendering an existing authorized saved composite is free unless the returned billing envelope says otherwise. Personal or Pro is the recommended experience for composite work involving another authorized person, deeper relationship exploration, transits, reports, and community learning.

## Chart images

Ask: **“Show my Human Design chart as a PNG.”** The assistant should resolve the account's primary chart directly, rather than search by your name. The MCP returns an inline image plus a short-lived download link for clients that do not display image blocks.

## Safety and billing

- API keys remain calculation-only; account-connected tools use OAuth.
- Discovery and permitted reads are free unless a result explicitly states otherwise.
- Existing-chart rendering is free; calculating and rendering a new chart uses one normal calculation unit.
- Existing-composite rendering follows the same image fallback: inline PNG where supported, plus a short-lived download link.
- Consuming or externally visible actions use previews, idempotency, and confirmation or a secure HumanDesign.ai handoff.
- The MCP never asks users to paste passwords, OAuth tokens, refresh tokens, API keys, or integration secrets into chat.

## Repository contents

- `plugins/human-design-ai/` — Claude and ChatGPT/Codex plugin package
- `.claude-plugin/marketplace.json` — Claude Code marketplace catalog
- `.agents/plugins/marketplace.json` — ChatGPT/Codex authoring marketplace
- `SUBMISSION.md` — directory-ready copy and listing metadata
- `llms.txt` — concise machine-readable product and connection summary

## Links

- Documentation: https://humandesignmcp.com
- HumanDesign.ai: https://humandesign.ai
- Privacy: https://humandesignmcp.com/privacy
- Terms: https://humandesignmcp.com/terms
- Support: https://humandesignmcp.com/faq

## License

MIT. The HumanDesign.ai name, logo, and brand assets remain trademarks of their respective owner.
