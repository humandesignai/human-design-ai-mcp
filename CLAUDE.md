# human-design-ai-mcp

## Feature registry (required)

The canonical list of every HumanDesign.ai feature, which plans include it, and what
enforces that lives in the **`hdai-feature-registry`** repo (under your Projects folder;
find it by name, the folder layout moves). Read it before describing, pricing or gating any
feature. It outranks this repo's own docs and any marketing copy.

This repo owns `api-mcp` (plugin distribution) in that registry.

When you ship a customer-visible change (new feature, rename, changed entitlement, changed
limit, changed price, retirement) update the registry in the SAME change and set that
entry's `lastVerified` to today, then run `npm run check` there. A change that alters
what members can do is not finished until the registry matches it.

If the registry says `unknown`, or an entry carries a contradiction with
`needsHumanDecision: true`, say so and stop. Do not infer a plan, price, limit or quota
the registry does not state. Read `plans.yaml`'s `traps:` block before writing any
entitlement gate; it records the identifier mistakes that have already caused real defects.

Then consider an announcement: `/announce-feature` diffs the registry, works out which
plans each change is news for, and drafts the newsletter, social posts and community post.
It stops at drafts; nothing sends without Kyle.
