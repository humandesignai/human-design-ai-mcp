# Directory submission copy

## Name

HumanDesign.ai MCP

## Short description

Connect Claude, ChatGPT, Codex, Cursor and VS Code to the same validated, versioned calculation service that powers HumanDesign.ai, including composite calculations, primary-chart resolution, deterministic bodygraph graphics, and authorized account workflows.

## mcpservers.org description

HumanDesign.ai MCP is the official HumanDesign.ai MCP server, for use with Claude, ChatGPT, Codex, Cursor and VS Code. It exposes the same validated, versioned calculation service that powers HumanDesign.ai, together with its reference data, rather than asking an agent to approximate chart mathematics. Developers can generate structured individual and two-person composite charts through the calculation surface. Signed-in members can retrieve and render their own primary chart, search permitted chart and saved-composite library data, review usage, list report templates, and read existing report status. When the live catalog advertises `chart_generate`, the MCP can preview and create the signed-in user's own primary chart without replacing an existing chart. The remote stateless Streamable HTTP server uses HumanDesign.ai OAuth for account tools and protected API keys for six calculation tools. It filters every catalog by server-derived capability grants, membership, workspace role, ownership, and entitlements, and returns versioned structured results with explicit quota and error metadata. Website Builder tools appear only when HumanDesign.ai has enabled the Builder for the connected account, and only when tools/list advertises them. Free members can view and render their own primary chart, and can create it when `chart_generate` is advertised; Individual adds account usage visibility; Personal is the minimum for wider authorized chart, saved-composite, library, and already-owned report access. Discovery, eligible reads, and existing-chart rendering are free; a newly calculated primary chart uses exactly one calculation unit after preview and confirmation. Report generation or delivery, Website Builder creation or publishing, community actions, and business control are not part of this release.

Consuming calculation calls use stable idempotency keys for quota-safe transport recovery. Matching retries consume no additional quota and may deterministically recompute the same validated result; the service does not claim byte-for-byte stored-response replay.

## One-line description

Validated HumanDesign.ai calculation data, deterministic bodygraph graphics, and authorized account tools for MCP-compatible agents.

## Endpoint

`https://mcp.humandesign.ai/`

## Transport and authentication

- Remote Streamable HTTP
- HumanDesign.ai OAuth 2.1 for account-connected tools
- Bearer API key or `X-Api-Key` for calculation-only tools
- Stateless JSON responses

## Categories

- Productivity
- Lifestyle
- Education
- Developer tools
- Data and analytics

## Keywords

`human design`, `bodygraph`, `chart`, `composite chart`, `relationship chart`, `transits`, `reports`, `website builder`, `OAuth`, `MCP`, `Claude`, `ChatGPT`, `Codex`

## Links

- Website: https://humandesignmcp.com
- Documentation: https://humandesignmcp.com/docs
- Privacy: https://humandesignmcp.com/privacy
- Terms: https://humandesignmcp.com/terms
- Source and plugin packages: https://github.com/humandesignai/human-design-ai-mcp

## Suggested test prompts

- Show my Human Design chart as a PNG.
- With an API-key calculation connection, create a composite chart for these two people.
- What can I explore with my current membership?
- Search my authorized chart library for a saved chart.
- Review my current HumanDesign.ai usage.
- List the report templates available to my account without generating anything.
