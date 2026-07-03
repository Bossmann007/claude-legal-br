#!/usr/bin/env bash
# Bump the model id referenced by every managed-agent cookbook in one shot.
# No floating "-latest" alias is documented for the Claude 4.x family, so the
# cookbook YAMLs pin concrete ids, tiered per task: heavy analysis/judgment on
# sonnet, light read/normalize/calculate/template on haiku. When a newer model
# ships, run this per-id instead of hand-editing 24 files. Examples:
#
#   ./scripts/bump-models.sh claude-sonnet-4-6 claude-sonnet-5
#   ./scripts/bump-models.sh claude-haiku-4-5 claude-haiku-5
#
# ponytail: dumb sed sweep, no yaml parsing — the model line is `model: <id>`
# and nothing else in these files matches an id, so a literal swap is safe.
set -euo pipefail

OLD="${1:?usage: bump-models.sh <old-id> <new-id>}"
NEW="${2:?usage: bump-models.sh <old-id> <new-id>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mapfile -t files < <(grep -rl "$OLD" "$ROOT/managed-agent-cookbooks" --include='*.yaml' || true)
if [ "${#files[@]}" -eq 0 ]; then
  echo "no files reference $OLD — nothing to do"; exit 0
fi

printf '%s\n' "${files[@]}" | xargs sed -i "s/${OLD//\//\\/}/${NEW//\//\\/}/g"
echo "bumped ${#files[@]} file(s): $OLD -> $NEW"
grep -rc "$NEW" "$ROOT/managed-agent-cookbooks" --include='*.yaml' | grep -v ':0' || true
