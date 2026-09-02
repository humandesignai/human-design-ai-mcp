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

if (mcp.mcpServers?.["human-design-ai"]?.url !== "https://mcp.humandesign.ai/") {
  throw new Error("Canonical MCP endpoint is missing or stale");
}
if (codex.name !== "human-design-ai" || claude.name !== "human-design-ai") {
  throw new Error("Plugin names must remain human-design-ai");
}
if (codex.version !== claude.version) throw new Error("Plugin versions must match");
if (claudeMarketplace.plugins?.[0]?.version !== claude.version) {
  throw new Error("Claude marketplace version must match the plugin");
}
if (!Array.isArray(codex.interface?.defaultPrompt) || codex.interface.defaultPrompt.length > 3) {
  throw new Error("Codex defaultPrompt must contain at most three prompts");
}

const textFiles = await Promise.all([
  readFile(join(root, "README.md"), "utf8"),
  readFile(join(root, "SUBMISSION.md"), "utf8"),
  readFile(join(root, "llms.txt"), "utf8"),
  readFile(join(plugin, "skills", "human-design-ai", "SKILL.md"), "utf8")
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

console.log(`Validated HumanDesign.ai plugin ${codex.version}`);
