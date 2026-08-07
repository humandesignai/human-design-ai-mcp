#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist_dir="$repo_root/dist"

mkdir -p "$dist_dir"
rm -f "$dist_dir/human-design-ai-plugin.zip"

cd "$repo_root/plugins"
zip -qr "$dist_dir/human-design-ai-plugin.zip" human-design-ai \
  -x "*/.DS_Store" "*/__MACOSX/*"

unzip -t "$dist_dir/human-design-ai-plugin.zip"
