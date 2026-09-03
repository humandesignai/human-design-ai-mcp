import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// URL.pathname leaves spaces percent-encoded (for example `HDAI%20Apps`), which
// makes every filesystem check fail when the repository lives in a normal named
// workspace folder. Always convert file URLs with the platform-aware Node helper.
const root = fileURLToPath(new URL("../", import.meta.url));
const plugin = join(root, "plugins", "human-design-ai");
const required = [
  "README.md",
  "SUBMISSION.md",
  "llms.txt",
  "capability-manifest.json",
  "chatgpt-app-submission.json",
  "LICENSE",
  ".claude-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
  "plugins/human-design-ai/.mcp.json",
  "plugins/human-design-ai/.codex-plugin/plugin.json",
  "plugins/human-design-ai/.claude-plugin/plugin.json",
  "plugins/human-design-ai/skills/human-design-ai/SKILL.md",
  "plugins/human-design-ai/assets/icon.png",
  "plugins/human-design-ai/assets/logo.png"
];

await Promise.all(required.map((path) => access(join(root, path))));

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const mcp = await readJson(join(plugin, ".mcp.json"));
const codex = await readJson(join(plugin, ".codex-plugin", "plugin.json"));
const claude = await readJson(join(plugin, ".claude-plugin", "plugin.json"));
const claudeMarketplace = await readJson(join(root, ".claude-plugin", "marketplace.json"));
const capabilities = await readJson(join(root, "capability-manifest.json"));
const chatgptSubmission = await readJson(join(root, "chatgpt-app-submission.json"));
const distributionPackage = await readJson(join(root, "package.json"));

const expectedCalculationTools = [
  "resolve_timezone",
  "generate_chart",
  "generate_composite_chart",
  "get_reference_item",
  "get_transits",
  "search_celebrities",
];
const expectedOAuthTools = [
  "account_get_context",
  "account_get_usage",
  "chart_get_primary",
  "chart_generate",
  "chart_render",
  "library_search",
  "library_get",
  "library_organize",
  "operation_get",
  "operation_cancel",
  "report_list_templates",
  "report_get",
  "builder_project_list",
  "builder_project_get",
  "builder_plan_get",
  "builder_run_get",
  "builder_run_cancel",
  "builder_preview_get",
  "builder_asset_list",
];
const expectedToolNames = [...expectedCalculationTools, ...expectedOAuthTools];
const expectedMinimumApiTiers = ["Free", "Free", "Free", "Free", "Startup", "Business"];
const expectedCalculationUnits = [0, 1, 1, 0, 1, 0];
const expectedWriteTools = new Set([
  "generate_chart",
  "generate_composite_chart",
  "get_transits",
  "chart_generate",
  "library_organize",
  "operation_cancel",
  "builder_run_cancel",
]);
const expectedDestructiveTools = new Set([
  "library_organize",
  "operation_cancel",
  "builder_run_cancel",
]);

if (mcp.mcpServers?.["human-design-ai"]?.url !== "https://mcp.humandesign.ai/") {
  throw new Error("Canonical MCP endpoint is missing or stale");
}
if (mcp.mcpServers?.["human-design-ai"]?.type !== "http") {
  throw new Error("Plugin MCP connection must use remote HTTP transport");
}
if (codex.name !== "human-design-ai" || claude.name !== "human-design-ai") {
  throw new Error("Plugin names must remain human-design-ai");
}
if (codex.mcpServers !== "./.mcp.json" || claude.mcpServers !== "./.mcp.json") {
  throw new Error("Claude and Codex manifests must reference the reviewed shared MCP connection");
}
if (codex.version !== claude.version) throw new Error("Plugin versions must match");
if (claudeMarketplace.plugins?.[0]?.version !== claude.version) {
  throw new Error("Claude marketplace version must match the plugin");
}
if (distributionPackage.version !== codex.version) {
  throw new Error("Distribution and plugin versions must match");
}
if (!Array.isArray(codex.interface?.defaultPrompt) || codex.interface.defaultPrompt.length > 3) {
  throw new Error("Codex defaultPrompt must contain at most three prompts");
}

const textFiles = await Promise.all([
  readFile(join(root, "README.md"), "utf8"),
  readFile(join(root, "SUBMISSION.md"), "utf8"),
  readFile(join(root, "llms.txt"), "utf8"),
  readFile(join(plugin, "README.md"), "utf8"),
  readFile(join(plugin, "skills", "human-design-ai", "SKILL.md"), "utf8"),
  readFile(join(root, "chatgpt-app-submission.json"), "utf8"),
  readFile(join(root, ".claude-plugin", "marketplace.json"), "utf8"),
  readFile(join(root, ".agents", "plugins", "marketplace.json"), "utf8"),
  readFile(join(plugin, ".claude-plugin", "plugin.json"), "utf8"),
  readFile(join(plugin, ".codex-plugin", "plugin.json"), "utf8"),
  readFile(join(plugin, ".mcp.json"), "utf8")
]);
const combined = textFiles.join("\n");
if (/api\.humandesign\.ai\/mcp|2025-11-05/.test(combined)) {
  throw new Error("Stale MCP endpoint or protocol reference found");
}
if (/github\.com\/kylehi2222\/human-design-ai-mcp/.test(combined) || codex.repository !== "https://github.com/humandesignai/human-design-ai-mcp") {
  throw new Error("Stale pre-transfer GitHub repository reference found");
}
if (/sk-[A-Za-z0-9_-]{10,}|Bearer\s+[A-Za-z0-9._-]{20,}/.test(combined)) {
  throw new Error("Possible credential material found");
}
if (!/generate_composite_chart/.test(combined) || !/composite relationship chart/i.test(combined)) {
  throw new Error("Composite chart capability or guidance is missing");
}
if (capabilities.canonicalEndpoint !== "https://mcp.humandesign.ai/" || capabilities.protocolVersion !== "2025-11-25") {
  throw new Error("Capability manifest endpoint or protocol is stale");
}
if (JSON.stringify(capabilities.calculationTools?.map((tool) => tool.name)) !== JSON.stringify(expectedCalculationTools)) {
  throw new Error("Capability manifest calculation tools do not match the contracted six");
}
if (JSON.stringify(capabilities.calculationTools?.map((tool) => tool.minimumApiTier)) !== JSON.stringify(expectedMinimumApiTiers)) {
  throw new Error("Capability manifest calculation tier boundaries are stale");
}
if (JSON.stringify(capabilities.calculationTools?.map((tool) => tool.units)) !== JSON.stringify(expectedCalculationUnits)) {
  throw new Error("Capability manifest calculation quota units are stale");
}
if (JSON.stringify(capabilities.authentication?.apiKeyHeaders) !== JSON.stringify(["Authorization: Bearer", "X-Api-Key"])) {
  throw new Error("Capability manifest must document both supported API-key header forms");
}
if (JSON.stringify(capabilities.calculationIdempotency?.requiredMcpTools) !== JSON.stringify([
  "generate_chart",
  "generate_composite_chart",
  "get_transits",
])) {
  throw new Error("Capability manifest consuming MCP idempotency tools are stale");
}
if (capabilities.calculationIdempotency?.mcpArgument !== "idempotencyKey"
  || capabilities.calculationIdempotency?.agentHttpHeader !== "Idempotency-Key"
  || capabilities.calculationIdempotency?.pattern !== "^[A-Za-z0-9._:-]{8,160}$") {
  throw new Error("Capability manifest idempotency field contract is invalid");
}
if (!/no additional quota/i.test(capabilities.calculationIdempotency?.replayBehavior ?? "")
  || !/deterministically recompute/i.test(capabilities.calculationIdempotency?.replayBehavior ?? "")
  || !/optional for direct REST and Agent HTTP/i.test(capabilities.calculationIdempotency?.directApiCompatibility ?? "")) {
  throw new Error("Capability manifest must describe quota-idempotent deterministic replay without overstating direct API enforcement");
}
if (JSON.stringify(capabilities.oauthTools?.map((tool) => tool.name)) !== JSON.stringify(expectedOAuthTools)) {
  throw new Error("Capability manifest OAuth tools do not match the newsletter release catalog");
}
if (!capabilities.membershipBoundaries?.Individual?.includes("internal identifier: solo")) {
  throw new Error("Capability manifest must record the Individual/solo membership boundary");
}
if (!/limited to the connected user's own primary chart/i.test(capabilities.membershipBoundaries?.Individual ?? "")) {
  throw new Error("Individual membership must not imply access to other people's charts");
}
if (!/minimum membership for wider authorized chart/i.test(capabilities.membershipBoundaries?.Personal ?? "")) {
  throw new Error("Personal must remain the minimum wider-design membership boundary");
}

if (chatgptSubmission.$schema !== "https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json" || chatgptSubmission.schema_version !== 1) {
  throw new Error("ChatGPT submission schema metadata is invalid");
}
if (chatgptSubmission.app_info?.display_name !== "HumanDesign.ai") {
  throw new Error("ChatGPT submission display name must remain HumanDesign.ai");
}
if (typeof chatgptSubmission.app_info?.subtitle !== "string" || chatgptSubmission.app_info.subtitle.length > 30) {
  throw new Error("ChatGPT submission subtitle must be present and no longer than 30 characters");
}
const submittedToolNames = Object.keys(chatgptSubmission.tools ?? {});
if (JSON.stringify(submittedToolNames) !== JSON.stringify(expectedToolNames)) {
  throw new Error("ChatGPT submission tools must exactly match the contracted calculation and OAuth tools");
}
for (const [name, tool] of Object.entries(chatgptSubmission.tools)) {
  const expectedAnnotations = {
    readOnlyHint: !expectedWriteTools.has(name),
    openWorldHint: false,
    destructiveHint: expectedDestructiveTools.has(name),
  };
  if (JSON.stringify(tool.annotations) !== JSON.stringify(expectedAnnotations)) {
    throw new Error(`ChatGPT annotations do not match runtime behavior for ${name}`);
  }
  const justifications = tool.justifications ?? {};
  for (const key of ["read_only_justification", "open_world_justification", "destructive_justification"]) {
    if (typeof justifications[key] !== "string" || justifications[key].trim().length < 20) {
      throw new Error(`ChatGPT submission is missing a useful ${key} for ${name}`);
    }
  }
}
if (chatgptSubmission.test_cases?.length !== 5) {
  throw new Error("ChatGPT submission must contain exactly five positive test cases");
}
if (chatgptSubmission.negative_test_cases?.length !== 3) {
  throw new Error("ChatGPT submission must contain exactly three negative test cases");
}
for (const testCase of chatgptSubmission.test_cases) {
  const toolNames = String(testCase.tools_triggered ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  if (toolNames.length === 0 || toolNames.some((name) => !expectedToolNames.includes(name))) {
    throw new Error(`Positive test case contains an unknown or missing exact tool name: ${testCase.description ?? "unnamed"}`);
  }
}
if (chatgptSubmission.negative_test_cases.some((testCase) => testCase.tools_triggered !== null)) {
  throw new Error("Negative test cases must not claim a tool trigger");
}
const agentFacingPolicy = [
  await readFile(join(plugin, "skills", "human-design-ai", "SKILL.md"), "utf8"),
  JSON.stringify(codex),
  JSON.stringify(claude),
].join("\n");
if (/strongly recommend|upsell|subscribe now|upgrade now|buy (personal|pro)/i.test(agentFacingPolicy)) {
  throw new Error("Agent-facing plugin content must not contain subscription promotion");
}
if (!/same (validated, versioned )?calculation service.*powers HumanDesign\.ai/is.test(combined)) {
  throw new Error("Reliability and authoritative calculation provenance are missing");
}
if (!/idempotencyKey/.test(combined) || !/no additional quota/i.test(combined) || !/not (a )?byte-for-byte/i.test(combined)) {
  throw new Error("Calculation retry guidance is missing or overstates stored-response replay");
}
if (!/server-derived capability grants/i.test(combined) || /OAuth scopes?[^.]{0,80}(filter|grant|unlock)/i.test(combined)) {
  throw new Error("OAuth identity scopes must remain distinct from server-derived capability grants");
}
if (!/active Builder rollout access/i.test(combined)) {
  throw new Error("Builder tooling must remain gated by active rollout access as well as entitlement");
}
if (/officially (approved|listed)|available (in|on) (the )?(ChatGPT|Claude) (plugin )?(directory|store)/i.test(combined)) {
  throw new Error("Distribution copy must not claim directory approval before it exists");
}
if (/api_key=|access_token=|refresh_token=/i.test(combined)) {
  throw new Error("Sensitive credentials must never be placed in URLs or public distribution copy");
}
if (/selected Personal account or workspace/i.test(combined)) {
  throw new Error("Workspace-selection copy must not imply that every selected boundary is a Personal plan");
}

console.log(`Validated HumanDesign.ai plugin ${codex.version}: ${expectedToolNames.length} tools, 5 positive tests, 3 negative tests`);
