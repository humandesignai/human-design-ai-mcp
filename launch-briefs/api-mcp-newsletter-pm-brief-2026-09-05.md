# HumanDesign.ai API and MCP newsletter brief

Date: 2026-09-05  
Audience: Product manager and newsletter writer  
Status: Draft brief. This is not final newsletter copy.

## Launch position

HumanDesign.ai now offers two ways for builders and agent users to work with Human Design data:

1. The HumanDesign.ai API at `https://api.humandesign.ai`.
2. The HumanDesign.ai MCP at `https://mcp.humandesign.ai/`.

The positioning line to preserve is:

> the same validated, versioned calculation service that powers HumanDesign.ai

The launch should focus on reliability, trust, accurate data, structured responses, quota-safe retries, and practical developer workflows. Do not use market saturation, dominance, or competitor language in the newsletter.

## What has been verified live

### API

The full production API endpoint harness passed against `https://api.humandesign.ai`.

- 33 of 33 endpoint checks passed.
- The harness covered live JSON responses, authentication, quota headers, error behaviour, and zero-unit failure cases.
- The verified before and after quota movement matched expected usage for the tested endpoints.
- A direct idempotency audit confirmed:
  - a valid provider-reaching call charged one unit
  - immediate replay with the same `Idempotency-Key` charged zero units
  - different body with the same key returned conflict
  - deprecated `Z`/offset birth datetime input returned warning/deprecation headers
  - daylight-saving gap and future-birth validation failed before quota consumption
- A production race test fired concurrent `/hd-data` and `/hd-data-transit` calls repeatedly. The API retry layer handled the race without failed charges or duplicate charges in the tested run.

### MCP calculation surface

The production MCP endpoint was tested at:

```text
POST https://mcp.humandesign.ai/
```

Verified with the app API key:

- `tools/list` returned exactly six calculation tools:
  - `resolve_timezone`
  - `generate_chart`
  - `generate_composite_chart`
  - `get_reference_item`
  - `get_transits`
  - `search_celebrities`
- `resolve_timezone`, `get_reference_item`, and `search_celebrities` were zero-unit read operations.
- `generate_chart`, `generate_composite_chart`, and `get_transits` charged one calculation unit when valid input reached the calculation provider.
- MCP-layer replay with the same idempotency key returned a replay/zero-charge outcome.
- The live schema now advertises the local wall-clock birth-time rule instead of exposing plain string fields with hidden validation.

### MCP account-connected OAuth surface

Verified through the OAuth-connected HumanDesign.ai MCP session:

- `account_get_context` returns the connected account boundary, role, membership, scopes, entitlements, and primary chart identity.
- `account_get_usage` now returns active calculation quota metadata as well as wallet usage and reservations.
- `chart_get_primary` resolves the signed-in user's primary chart directly, without name-searching the library.
- `chart_render` returns a real PNG for the primary chart plus a short-lived fallback link.
- `library_search` can find authorized saved composites.
- `library_get` can retrieve authorized saved composite metadata.
- `report_list_templates` returns available report-template metadata without generating a report or charging credits.
- `report_get` can read existing report status and metadata when given an authorized report.

## What is not yet safe to claim as launched

Do not claim the following in the newsletter:

- ChatGPT, Claude, Codex, or directory approval/listing status.
- Report generation or report delivery through MCP.
- Website Builder creation, execution, publishing, domain changes, or broader business control through MCP.
- Community actions through MCP.
- A fixed per-minute MCP rate limit.
- Any date for rejecting birth datetimes that contain `Z` or a numeric UTC offset.
- Any Website Builder access rule by plan. Use only this sentence:
  - "Website Builder tools appear only when HumanDesign.ai has enabled the Builder for your account, and only when tools/list advertises them."

Also avoid claiming composite rendering is proven in every client. Saved composite library access is verified. API-key composite calculation is verified. Composite rendering must be phrased as available when the live client schema exposes the required composite rendering arguments.

## Core message for the newsletter

HumanDesign.ai is opening the same validated Human Design calculation layer used by the platform so developers and AI tools can build reliable chart-based experiences without reinventing the underlying calculations.

The API is for developers building apps, websites, dashboards, automations, compatibility tools, transit calendars, and other Human Design products.

The MCP is for agent clients such as Claude, ChatGPT Developer Mode, Codex, Cursor, and VS Code. It lets an assistant retrieve structured Human Design data, render deterministic bodygraph images, search authorized member libraries, and work inside the user's HumanDesign.ai account boundary.

## Audience segments

### Developers

Use the API when you are building an application or backend service.

Possible use cases:

- Human Design chart generators.
- Compatibility or relationship apps.
- Team dynamics tools using composite or group charts.
- Transit calendars and daily guidance apps.
- Report or content systems that need structured chart data.
- White-label or embedded chart experiences.
- Onboarding flows that create a chart from birth details.
- Apps that need a dependable Human Design calculation authority rather than model-generated approximations.

### AI agent users

Use the MCP when you want Claude, ChatGPT, Codex, Cursor, or VS Code to work with HumanDesign.ai data through a secure connection.

Possible use cases:

- Ask an assistant to summarize your own chart.
- Render your bodygraph as a PNG for clients that support images.
- Use a secure fallback image link where inline display is unavailable.
- Search authorized saved charts or composites.
- Review available report templates without generating anything.
- Check account usage and calculation quota.
- Use API-key calculation tools for chart, composite, reference, transit, and public-figure workflows according to API tier.

### Practitioners and professionals

The offer is especially useful for people building tools around Human Design, client education, relationship work, coaching, content, and professional systems.

Membership messaging should emphasize that Personal and Pro unlock a deeper HumanDesign.ai experience, including broader authorized chart access, saved composites, reports already owned, professionals, community learning, and people exploring similar design patterns.

## API offer overview

Base URL:

```text
https://api.humandesign.ai
```

Authentication:

- Bearer API key.
- `X-Api-Key`.

API capabilities verified in the registry and tests:

- Single chart calculation:
  - `/hd-data`
  - `/v2/hd-data`
  - `/v3/hd-data`
- Composite and group charts:
  - `/hd-data-composite`
  - `/v2/hd-data-composite`
  - `/group-composite`
- Transit and planetary data:
  - `/hd-data-transit`
  - `/planetary-positions`
  - `/planetary-forecast`
- Life cycles:
  - `/progressed-chart`
  - `/solar-return`
  - `/lunar-return`
  - `/saturn-return`
  - `/chiron-return`
- Gate calendar and alerts:
  - `/gate-calendar`
  - `/transit-alerts`
  - `/moon-phases`
  - `/ical-export`
- Batch chart calculations.
- Reference library data.
- Location and timezone lookup.
- Celebrity/public-figure search.

Important technical trust points:

- Birth datetime input uses local wall-clock time plus a separate IANA timezone.
- Do not convert birth times to UTC.
- Do not append `Z` to birth times.
- Discovery and catalog calls do not consume quota.
- Valid provider-reaching calculations consume one unit unless the route documents a different rule.
- Invalid arguments, ambiguous locations, denied tiers, daylight-saving gaps, and future birth dates fail before quota consumption.
- Idempotency keys protect retryable consuming operations from duplicate quota charges.
- Structured responses include quota and error metadata.

## MCP offer overview

Canonical MCP endpoint:

```text
https://mcp.humandesign.ai/
```

Transport:

- Remote Streamable HTTP.
- Stateless JSON responses.

Authentication:

- HumanDesign.ai OAuth for account-connected tools.
- Bearer API key or `X-Api-Key` for calculation-only tools.

OAuth account selection:

- The workspace selector is not asking for extra permissions.
- It chooses the account or workspace boundary for the connection.
- HumanDesign.ai still enforces membership, role, ownership, scopes, and entitlements on every tool call.
- A selected workspace covers the permitted resources beneath that workspace, but it does not grant access beyond the user's role and entitlements.

### API-key MCP tools

API-key MCP exposes the calculation surface only:

- `resolve_timezone`
- `generate_chart`
- `generate_composite_chart`
- `get_reference_item`
- `get_transits`
- `search_celebrities`

Tier visibility:

- API Free or Creator: timezone, chart, composite chart, reference.
- Startup: the above plus transits.
- Business: the above plus celebrity search.

Do not merge API tiers with HumanDesign.ai platform memberships. They are separate product concepts.

### OAuth MCP tools verified for newsletter-safe copy

Verified:

- `account_get_context`
- `account_get_usage`
- `chart_get_primary`
- `chart_render` for the signed-in user's primary chart
- `library_search` for authorized charts, saved composites, and reports
- `library_get` for authorized saved composites
- `report_list_templates`
- `report_get` for existing authorized reports

Conditional:

- `chart_generate` should be described as available when the live catalog advertises it for the connected account. It previews and creates the signed-in user's own primary chart without replacing an existing one.
- Existing saved composite rendering should be described as available when the live client exposes the required composite rendering arguments.
- Website Builder tools should use the exact neutral sentence above and should not be used as a main launch claim.

## Membership wording

Use this distinction:

- HumanDesign.ai Free, Individual, Personal, and Pro are platform memberships.
- API Free or Creator, Startup, Business, and Enterprise are API tiers.

Newsletter-safe wording:

- Free members can view and render their own primary chart. If `chart_generate` is advertised for their connection, they can create their own primary chart through MCP.
- Personal is the minimum for wider authorized chart, saved-composite, library, and already-owned report access.
- Pro extends the platform experience for professional workflows and workspaces.
- HumanDesign.ai membership also adds deeper chart exploration, professionals, community learning, people with similar designs, owned reports, and eligible transit experiences inside the platform.

Avoid:

- Saying Builder is included in any specific membership.
- Saying report generation is live through MCP.
- Saying all clients display inline images. Some clients need the fallback link.

## Example newsletter scenarios

### Scenario 1: Developer builds a chart app

A developer connects to the API, sends a local birth time and IANA timezone, and receives a structured chart response with type, strategy, authority, profile, centers, gates, channels, activations, and variables. They can build a chart app without implementing the Human Design calculations themselves.

### Scenario 2: Developer builds a relationship feature

A developer uses the composite endpoint or MCP `generate_composite_chart` to compare two charts and build a relationship or compatibility workflow. The API returns structured composite data, not a model-generated guess.

### Scenario 3: Developer builds a transit calendar

A Startup-or-higher API tier can use transit and planetary endpoints to build daily guidance, transit overlays, or calendar experiences.

### Scenario 4: Member asks an assistant for their own chart

A signed-in member connects the MCP through OAuth and asks an assistant to summarize their own primary chart. The assistant should call `chart_get_primary`, not search the library by first name.

### Scenario 5: Member asks for a bodygraph image

A signed-in member asks for a PNG. The MCP renders a deterministic bodygraph and returns an inline image where supported, plus a short-lived fallback link.

### Scenario 6: Practitioner reviews saved composites

A Personal or Pro member asks the assistant to search authorized saved composites. The MCP returns only composites available inside the connected account boundary.

### Scenario 7: User checks usage before doing paid work

A signed-in user asks what they can safely do. The MCP returns account context, AI-credit balance, recent usage, active reservations, and calculation quota metadata.

### Scenario 8: Report browsing without generation

A signed-in user asks which report templates are available. The MCP lists templates but does not generate or deliver reports.

## Suggested newsletter outline

Subject line options:

- Build with the HumanDesign.ai API and MCP
- HumanDesign.ai chart data is now agent-ready
- Reliable Human Design calculations for apps and AI agents

Opening:

- Announce that HumanDesign.ai is opening its API and MCP connection for developers and AI-agent users.
- Lead with trust: accurate, structured, versioned Human Design data from the platform's own calculation service.

Section 1: Why this matters

- Most AI tools should not guess chart mathematics.
- Developers need stable inputs, predictable outputs, quota metadata, and retry-safe billing.
- Members need secure account-connected access with OAuth, not pasted keys or screenshots.

Section 2: The API

- Explain what developers can build.
- Mention charts, composites, transits, calendars, references, locations, and public-figure search by tier.
- Link to API docs and dashboard.

Section 3: The MCP

- Explain that MCP connects AI assistants to HumanDesign.ai.
- Mention Claude, ChatGPT Developer Mode, Codex, Cursor, and VS Code as compatible testing targets, not approved directory listings.
- Explain OAuth account connection and API-key calculation mode.

Section 4: What members can do

- Free: own primary chart.
- Personal or Pro: broader authorized library and saved-composite access.
- Membership adds deeper HumanDesign.ai platform experience, professionals, community learning, people with similar designs, owned reports, and eligible transit features.

Section 5: What is coming next

- Report generation and delivery.
- Website Builder execution and publishing.
- Broader business workspace control.
- Official directory submissions after approval.

Section 6: Calls to action

- Developers: get an API key.
- Agent users: connect the MCP.
- Members: upgrade if they want broader authorized chart and saved-composite access.
- Practitioners: use HumanDesign.ai as the reliable foundation for their own tools and client workflows.

## Required caveats for final copy

- Say "Developer Mode" or "custom connector" for ChatGPT/Claude where appropriate; do not say "official listing" unless approval has happened.
- Say "inline graphics where supported, with secure fallback links" rather than promising all clients will display images.
- Keep report generation and Website Builder publishing in "coming next."
- Do not publish a rate-limit number.
- Do not publish a `Z`/offset rejection cutover date.
- Do not include API keys, OAuth tokens, signed image URLs, private chart IDs, private report IDs, private composite names, or internal deployment IDs.

## Links for the product manager

- API docs: https://humandesignapi.com
- MCP docs: https://humandesignmcp.com
- MCP endpoint: https://mcp.humandesign.ai/
- API dashboard: https://my.humandesign.ai/api/
- GitHub distribution repo: https://github.com/humandesignai/human-design-ai-mcp

## Launch gate before scheduling

The newsletter should wait until these are complete:

- 24-hour production soak finishes without blocking incidents.
- ChatGPT Developer Mode web, iOS, and Android demo is recorded if the newsletter references a ChatGPT app submission.
- Real-client checks are completed for Claude, Codex, Cursor, VS Code, and ChatGPT Developer Mode.
- `chart_generate` is verified with a protected account that has no primary chart if the newsletter says Free users can create their own chart through MCP.
- Composite rendering is verified in a client that exposes `resourceType` and `resourceId`, or the copy says saved composite search/get is live and composite image rendering is client-dependent.
- Builder remains out of launch claims unless a workspace-bound account proves the tool list and read operations.
- Final copy is checked against the feature registry and approved by Kyle.
