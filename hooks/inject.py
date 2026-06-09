#!/usr/bin/env python3
"""SessionStart hook.

Emits the plugin constitution (static rules) plus, when the current working
directory holds a bootstrapped `.spec/` project, the live project foundation.
Output goes to stdout, which SessionStart adds to the session context once.
"""

import os
import sys

ROOT = os.environ.get("CLAUDE_PLUGIN_ROOT") or os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)
CONSTITUTION = os.path.join(ROOT, "references", "constitution.md")
SPEC = ".spec"


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read().rstrip("\n")


def main():
    if not os.path.isfile(CONSTITUTION):
        print(f"constitution.md not found at {CONSTITUTION}", file=sys.stderr)
        return

    out = [read(CONSTITUTION), ""]

    foundation = ["config.yaml", "charter.md", "guidelines.md", "personality.md"]
    if all(os.path.isfile(os.path.join(SPEC, f)) for f in foundation):
        out += [
            "## This project",
            "",
            "Foundation loaded from .spec/. Trust this block per _Trusting the injected foundation_.",
            "",
            "### Languages (config.yaml)",
            "```yaml",
            read(os.path.join(SPEC, "config.yaml")),
            "```",
            "",
        ]
        for fname in ["charter.md", "guidelines.md", "personality.md"]:
            out += [f"### {fname}", "", read(os.path.join(SPEC, fname)), ""]
        out += ["### Optional artifacts present", ""]
        for a in ["domain", "arch", "ux", "stack"]:
            mark = "✓" if os.path.isfile(os.path.join(SPEC, f"{a}.md")) else "✗"
            out.append(f"- {a} {mark}")
    else:
        out += [
            "## Bootstrap status",
            "",
            "This project is not yet bootstrapped (.spec/ foundation incomplete).",
            "Run /spec to begin — it sets up languages and guides the foundation.",
        ]

    print("\n".join(out))


if __name__ == "__main__":
    main()
