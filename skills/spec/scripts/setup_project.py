#!/usr/bin/env python3
"""Adapt a consumer project's environment to the plugin — consent-gated setup.

Three opt-in, idempotent actions, each merged into the user's own files without
clobbering anything already there:

- permissions: in the project's `.claude/settings.local.json`, allow reading the
  plugin's rubric/reference trees, reading the project's own `.spec/` artifacts
  (also covers the forked critics, which inherit these rules), running the
  coordinator script, and invoking the plugin's skills — so the harness stops
  prompting per read, per coordinator call, and per skill call.
- markdownlint: an opinionated root `.markdownlint.json` (line-length off for
  tables/code/headings, sane prose width) so a markdownlint-based editor stops
  false-flagging generated `.spec/` tables — every other markdownlint rule
  (fenced-code-language, heading hygiene, …) stays on and now covers the whole
  project. Deep-merged: an existing rule the user already set is kept, and any
  conflict is reported, never overwritten.
- prettier: only when the project actually uses prettier — ensure `.spec/` is
  in `.prettierignore`, so the user's formatter does not fight the plugin's own
  `.spec/` formatter (the format hook). Alignment of the user's *own* markdown
  is prettier's job, not markdownlint's — markdownlint cannot align tables.

Run with `--dry-run` to preview every change without writing. Each action
reports exactly what it added and flags any pre-existing setting left untouched.

Pure standard library. A consumer never runs this blind: the orchestrator
previews it (`--dry-run`), asks consent, then runs it for real.

    setup_project.py --project . [--dry-run] [--only permissions,markdownlint,prettier]
"""

import argparse
import json
import os
import re
from pathlib import Path

# Opinionated markdownlint baseline. Only deviations from markdownlint's
# defaults are listed — every unlisted rule (MD040 fenced-code-language, etc.)
# stays on. MD013 is relaxed exactly where wrapping is impossible or harmful.
RECOMMENDED_MARKDOWNLINT = {
    "MD013": {
        "line_length": 120,
        "tables": False,
        "code_blocks": False,
        "headings": False,
    }
}

PRETTIER_MARKERS = (
    ".prettierrc", ".prettierrc.json", ".prettierrc.yaml", ".prettierrc.yml",
    ".prettierrc.js", ".prettierrc.cjs", ".prettierrc.mjs", ".prettierrc.toml",
    "prettier.config.js", "prettier.config.cjs", "prettier.config.mjs",
)


def plugin_root():
    # skills/spec/scripts/setup_project.py -> plugin repo root
    return Path(__file__).resolve().parents[3]


def plugin_name(root):
    manifest = root / ".claude-plugin" / "plugin.json"
    try:
        return json.loads(manifest.read_text())["name"]
    except (OSError, ValueError, KeyError):
        return root.name


def frontmatter_name(md_file, fallback):
    match = re.search(r"^name:\s*(\S+)", md_file.read_text(), re.MULTILINE)
    return match.group(1) if match else fallback


def load_json(path):
    """Parse a JSON file; raise SystemExit (nothing written) on a corrupt one."""
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text() or "{}")
    except ValueError as err:
        raise SystemExit(f"abort, nothing written — invalid JSON in {path}: {err}")


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


# --- permissions ------------------------------------------------------------

def permission_rules(root, namespace):
    abs_root = root.as_posix()  # e.g. /Users/me/plugin (single leading slash)
    # Plugin reads, scoped to the two trees the flow actually reads (rubrics,
    # references) — not the whole root, so sibling dev files (notes/, .git/) stay
    # out. The forked critics inherit these rules and read the same trees.
    rules = [
        f"Read(//{abs_root.lstrip('/')}/skills/**)",
        f"Read(//{abs_root.lstrip('/')}/references/**)",
    ]
    # Project-side reads: the orchestrator and every forked critic (audit,
    # consistency, detector) read the project's own artifacts under .spec/.
    # Read rules govern Glob/Grep too, so this one line covers all three tools.
    rules.append("Read(.spec/**)")
    # The coordinator is invoked over Bash on every state write; pre-approve that
    # one script (prefix match, args wild) so the flow stops prompting per call.
    rules.append(f"Bash(python3 {abs_root}/hooks/project_file.py *)")
    rules += [
        f"Skill({namespace}:{frontmatter_name(md, md.parent.name)})"
        for md in sorted((root / "skills").glob("*/SKILL.md"))
    ]
    agents = root / "agents"
    if agents.is_dir():
        rules += [
            f"Task({namespace}:{frontmatter_name(md, md.stem)})"
            for md in sorted(agents.glob("*.md"))
        ]
    return rules


def apply_permissions(project, dry_run):
    root = plugin_root()
    rules = permission_rules(root, plugin_name(root))
    target = project / ".claude" / "settings.local.json"
    settings = load_json(target)
    if not isinstance(settings, dict) or not isinstance(settings.get("permissions", {}), dict):
        raise SystemExit(f"abort, nothing written — 'permissions' is not an object in {target}")
    allow = settings.get("permissions", {}).get("allow", [])
    if not isinstance(allow, list):
        raise SystemExit(f"abort, nothing written — 'permissions.allow' is not a list in {target}")
    added = [r for r in rules if r not in allow]
    if not dry_run and added:
        settings.setdefault("permissions", {}).setdefault("allow", []).extend(added)
        write_json(target, settings)
    return {"target": str(target), "added": added, "conflicts": []}


# --- markdownlint (recursive deep-merge, never clobbers a set leaf) ----------

def deep_merge(base, overlay, path=""):
    """Add overlay leaves missing from base; keep existing ones, reporting any
    that differ. Returns (added_paths, conflict_paths)."""
    added, conflicts = [], []
    for key, val in overlay.items():
        here = f"{path}.{key}" if path else key
        if key not in base:
            base[key] = val
            added.append(here)
        elif isinstance(val, dict) and isinstance(base[key], dict):
            a, c = deep_merge(base[key], val, here)
            added += a
            conflicts += c
        elif base[key] != val:
            conflicts.append(f"{here} (yours: {base[key]!r}, recommended: {val!r})")
    return added, conflicts


def apply_markdownlint(project, dry_run):
    target = project / ".markdownlint.json"
    config = load_json(target)
    if not isinstance(config, dict):
        raise SystemExit(f"abort, nothing written — {target} is not a JSON object")
    merged = json.loads(json.dumps(config))  # work on a copy for dry-run honesty
    added, conflicts = deep_merge(merged, RECOMMENDED_MARKDOWNLINT)
    if not dry_run and added:
        write_json(target, merged)
    return {"target": str(target), "added": added, "conflicts": conflicts}


# --- prettier (only when the project already uses prettier) ------------------

def uses_prettier(project):
    if any((project / m).exists() for m in PRETTIER_MARKERS):
        return True
    if (project / ".prettierignore").exists():
        return True
    pkg = project / "package.json"
    try:
        return "prettier" in json.loads(pkg.read_text())
    except (OSError, ValueError):
        return False


def apply_prettier(project, dry_run):
    target = project / ".prettierignore"
    if not uses_prettier(project):
        return {"target": str(target), "added": [], "conflicts": [], "skipped": "no prettier in project"}
    lines = target.read_text().splitlines() if target.exists() else []
    entry = ".spec/"
    added = [] if entry in lines else [entry]
    if not dry_run and added:
        with open(target, "a", encoding="utf-8") as f:
            if lines and lines[-1].strip():
                f.write("\n")
            f.write(entry + "\n")
    return {"target": str(target), "added": added, "conflicts": []}


# --- driver -----------------------------------------------------------------

ACTIONS = {
    "permissions": apply_permissions,
    "markdownlint": apply_markdownlint,
    "prettier": apply_prettier,
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", default=".", help="consumer project root (default: cwd)")
    parser.add_argument("--dry-run", action="store_true", help="preview; write nothing")
    parser.add_argument("--only", default="", help="comma-separated subset of: " + ",".join(ACTIONS))
    args = parser.parse_args()

    project = Path(args.project).resolve()
    selected = [a.strip() for a in args.only.split(",") if a.strip()] or list(ACTIONS)
    unknown = [a for a in selected if a not in ACTIONS]
    if unknown:
        raise SystemExit(f"unknown action(s): {', '.join(unknown)}")

    verb = "would add" if args.dry_run else "added"
    for name in selected:
        result = ACTIONS[name](project, args.dry_run)
        print(f"[{name}] {result['target']}")
        if result.get("skipped"):
            print(f"  skipped — {result['skipped']}")
        for rule in result["added"]:
            print(f"  {verb}: {rule}")
        for clash in result["conflicts"]:
            print(f"  kept yours (not overwritten): {clash}")
        if not result["added"] and not result.get("skipped"):
            print("  already configured")


if __name__ == "__main__":
    main()
