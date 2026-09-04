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
const capabilityText = await readFile(join(root, "capability-manifest.json"), "utf8");
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
// Positioning line for the calculation service. It is quoted verbatim wherever the
// service is described; variants that drop "validated," or swap in "authority" are drift.
const provenanceLine = /the same validated, versioned calculation service that powers HumanDesign\.ai/;
const provenanceFiles = {
  "README.md": textFiles[0],
  "SUBMISSION.md": textFiles[1],
  "llms.txt": textFiles[2],
  "plugins/human-design-ai/README.md": textFiles[3],
  "chatgpt-app-submission.json": textFiles[5],
  "plugins/human-design-ai/.codex-plugin/plugin.json": textFiles[9],
  "capability-manifest.json": capabilityText,
};
for (const [name, text] of Object.entries(provenanceFiles)) {
  if (!provenanceLine.test(text)) {
    throw new Error(`${name} must carry the calculation-service provenance line verbatim`);
  }
}
if (/same (?:versioned|validated,? versioned chart) calculation|calculation authority used by|validated chart service/i.test(`${combined}\n${capabilityText}`)) {
  throw new Error("Calculation-service provenance line has drifted from the verbatim wording");
}
if (!/idempotencyKey/.test(combined) || !/no additional quota/i.test(combined) || !/not (a )?byte-for-byte/i.test(combined)) {
  throw new Error("Calculation retry guidance is missing or overstates stored-response replay");
}
if (!/server-derived capability grants/i.test(combined) || /OAuth scopes?[^.]{0,80}(filter|grant|unlock)/i.test(combined)) {
  throw new Error("OAuth identity scopes must remain distinct from server-derived capability grants");
}
// Website Builder access. Distribution copy states no Builder access rule: every
// customer-facing file carries one neutral sentence, and no sentence that mentions the
// Builder may name a plan or membership word as a condition. Plan names stay
// case-sensitive on purpose: "individual charts" and the Builder's own site "plan"
// are ordinary words in this copy.
const builderAccessSentence = /Website Builder tools appear only when HumanDesign\.ai has enabled the Builder for (?:your|the connected|the user's) account, and only when `?tools\/list`? advertises them\./;
const builderRuleFiles = {
  "README.md": textFiles[0],
  "SUBMISSION.md": textFiles[1],
  "llms.txt": textFiles[2],
  "plugins/human-design-ai/skills/human-design-ai/SKILL.md": textFiles[4],
  "chatgpt-app-submission.json": textFiles[5],
  "capability-manifest.json": capabilityText,
};
for (const [name, text] of Object.entries(builderRuleFiles)) {
  if (!builderAccessSentence.test(text)) {
    throw new Error(`${name} must carry the neutral Website Builder access sentence`);
  }
}
if (typeof capabilities.builderAccess !== "string" || !builderAccessSentence.test(capabilities.builderAccess)) {
  throw new Error("Capability manifest builderAccess must be the neutral Website Builder access sentence");
}
if (/builder/i.test(JSON.stringify(capabilities.membershipBoundaries ?? {}))) {
  throw new Error("Capability manifest membership boundaries must not mention the Builder");
}
const builderScanText = `${combined}\n${capabilityText}`;
if (/Builder rollout|rollout access|rollout flag/i.test(builderScanText)) {
  throw new Error("Builder access must not be described as rollout access");
}
// Split into sentences; "HumanDesign.ai" and URLs must not count as sentence ends.
const sentences = builderScanText
  .replace(/humandesign\.ai/gi, "humandesign-ai")
  .split(/[.!?](?=["')\s]|$)|\n/)
  .map((sentence) => sentence.trim())
  .filter(Boolean);
const planNameInSentence = /\b(?:Free|Individual|Personal|Pro|Max)\b/;
const membershipWordInSentence = /\b(?:solo|memberships?|rollouts?|subscriptions?|paid|feature flags?|upgrades?)\b/i;
const builderSentences = sentences.filter((sentence) => /builder/i.test(sentence));
const offendingBuilderSentences = builderSentences.filter(
  (sentence) => planNameInSentence.test(sentence) || membershipWordInSentence.test(sentence),
);
if (offendingBuilderSentences.length > 0) {
  throw new Error(`Builder access must not be stated in terms of a plan or membership: ${JSON.stringify(offendingBuilderSentences)}`);
}

// Birth inputs are wall-clock values with a separate IANA timezone, and no cutover date
// is ever stated for the deprecated Z/offset forms.
const wallClockRule = /as it read on the clock where the person was born, with no `?Z`? and no UTC offset/;
const ianaRule = /timezone[^.]{0,80}IANA identifier/i;
const inputGuidanceFiles = {
  "README.md": textFiles[0],
  "llms.txt": textFiles[2],
  "plugins/human-design-ai/README.md": textFiles[3],
  "plugins/human-design-ai/skills/human-design-ai/SKILL.md": textFiles[4],
};
for (const [name, text] of Object.entries(inputGuidanceFiles)) {
  if (!wallClockRule.test(text) || !ianaRule.test(text)) {
    throw new Error(`${name} must explain wall-clock birth times with a separate IANA timezone`);
  }
}
const datedCutover = sentences.filter(
  (sentence) => /deprecat|cutover|stop being accepted|no longer accepted/i.test(sentence)
    && (/\b(?:19|20)\d\d-\d\d(?:-\d\d)?\b/.test(sentence)
      || /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(sentence)),
);
if (datedCutover.length > 0) {
  throw new Error(`Do not state a cutover date for deprecated birth-time formats: ${JSON.stringify(datedCutover)}`);
}

// "official" describes first-party ownership only, never status with a client or directory.
if (/\bofficial\b[^.\n]{0,60}\b(?:server|plugin|MCP|app|connector)s? for (?:Claude|ChatGPT|Codex|Cursor|VS Code|OpenAI)\b/i.test(builderScanText.replace(/humandesign\.ai/gi, "humandesign-ai"))) {
  throw new Error("\"official\" may describe first-party ownership only, not status with Claude, ChatGPT, Codex or a directory");
}
if (/\buptime\b|\bSLA\b|\b99\.\d+ ?%|guaranteed availability|most accurate|\bthe leading\b|world's (?:best|leading|first)/i.test(builderScanText)) {
  throw new Error("Distribution copy must not make uptime, SLA or market-dominance claims");
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

console.log([
  `Validated HumanDesign.ai plugin ${codex.version}: ${expectedToolNames.length} tools, 5 positive tests, 3 negative tests`,
  `provenance line verbatim in ${Object.keys(provenanceFiles).length} files`,
  `neutral Builder sentence in ${Object.keys(builderRuleFiles).length} files`,
  `${builderSentences.length} Builder sentences scanned, ${offendingBuilderSentences.length} naming a plan or membership`,
  `wall-clock birth rule in ${Object.keys(inputGuidanceFiles).length} files, ${datedCutover.length} dated cutovers`,
].join("; "));
