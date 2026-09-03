#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist_dir="$repo_root/dist"
build_dir="$(mktemp -d)"
trap 'rm -rf "$build_dir"' EXIT

mkdir -p "$dist_dir"
rm -f "$dist_dir/human-design-ai-plugin.zip"

cp -R "$repo_root/plugins/human-design-ai" "$build_dir/human-design-ai"
find "$build_dir/human-design-ai" -name .DS_Store -delete
find "$build_dir/human-design-ai" -type d -exec chmod 0755 {} +
find "$build_dir/human-design-ai" -type f -exec chmod 0644 {} +
find "$build_dir/human-design-ai" -exec touch -t 200001010000 {} +

cd "$build_dir"
LC_ALL=C find human-design-ai -print | LC_ALL=C sort | zip -X -q "$dist_dir/human-design-ai-plugin.zip" -@

unzip -t "$dist_dir/human-design-ai-plugin.zip"
