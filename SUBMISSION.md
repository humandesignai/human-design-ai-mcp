# Directory submission copy

## Name

HumanDesign.ai MCP

## Short description

Connect Claude, ChatGPT, Codex, Cursor, and VS Code to the validated chart service that powers HumanDesign.ai, including primary-chart creation, composite calculations, deterministic bodygraph graphics, and authorized account workflows.

## mcpservers.org description

HumanDesign.ai MCP is the official Human Design server for Claude, ChatGPT, Codex, Cursor, and VS Code. It exposes the same validated, versioned chart calculation service and reference data that power HumanDesign.ai, rather than asking an agent to approximate chart mathematics. Developers can generate structured individual and two-person composite charts through the calculation surface. Signed-in members can create or retrieve their own primary chart, render authorized individual or saved-composite bodygraphs as deterministic PNG or SVG, search permitted library data, review usage and existing report status, and inspect entitled Website Builder projects or cancel an eligible run. The remote stateless Streamable HTTP server uses HumanDesign.ai OAuth for account tools and protected API keys for six calculation tools. It filters every catalog by membership, workspace role, ownership, scopes, and entitlements, and returns versioned structured results with explicit quota and error metadata. Free members can create, save, view, and render their own primary chart; Individual adds account usage visibility; Personal is the minimum for wider authorized chart, saved-composite, library, and already-owned report access. Discovery, eligible reads, and existing-chart rendering are free; a newly calculated primary chart uses exactly one calculation unit after preview and confirmation. Report generation or delivery, Website Builder creation or publishing, community actions, and business control are not part of this release.

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
- List the Website Builder projects I am allowed to access.
