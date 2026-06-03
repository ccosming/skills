#!/usr/bin/env bash
# SessionStart hook.
# Emits the plugin constitution (static rules) plus, when the current working
# directory holds a bootstrapped .spec/ project, the live project foundation.
# Output goes to stdout, which SessionStart adds to the session context once.
set -euo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CONSTITUTION="$ROOT/references/constitution.md"
SPEC=".spec"

[ -f "$CONSTITUTION" ] || { echo "constitution.md not found at $CONSTITUTION" >&2; exit 0; }

cat "$CONSTITUTION"
echo

if [ -f "$SPEC/config.yaml" ] && [ -f "$SPEC/overview.md" ] \
   && [ -f "$SPEC/guidelines.md" ] && [ -f "$SPEC/personality.md" ]; then
  echo "## This project"
  echo
  echo "Foundation loaded from .spec/. Trust this block per _Trusting the injected foundation_."
  echo
  echo "### Languages (config.yaml)"
  echo '```yaml'
  cat "$SPEC/config.yaml"
  echo '```'
  echo
  echo "### overview.md"
  echo
  cat "$SPEC/overview.md"
  echo
  echo "### guidelines.md"
  echo
  cat "$SPEC/guidelines.md"
  echo
  echo "### personality.md"
  echo
  cat "$SPEC/personality.md"
  echo
  echo "### Optional artifacts present"
  echo
  for a in domain arch ux stack; do
    if [ -f "$SPEC/$a.md" ]; then echo "- $a ✓"; else echo "- $a ✗"; fi
  done
else
  echo "## Bootstrap status"
  echo
  echo "This project is not yet bootstrapped (.spec/ foundation incomplete)."
  echo "Recommended path: /setup → /overview → /guidelines → /personality → /stack. Optional: /domain, /arch, /ux."
fi
