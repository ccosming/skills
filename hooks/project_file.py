#!/usr/bin/env python3
"""Single-writer coordinator for `.spec/project.json`.

Every hook and skill that mutates the project's non-artifact state goes through
here — none writes the file directly. That is what makes one shared file safe:
an exclusive `flock` serializes a metrics-hook fire against an `/spec` capture
deposit, and each caller does read-modify-write (reads the latest on disk,
changes only its own slice, writes back), so neither clobbers the other's
section.

`project.json` holds everything that is not a versioned artifact:

    {
      "version": 1,
      "language": {"chat": "en", "artifacts": "en"},   # owned by /spec
      "state":   {"in_flight": null, "next_suggested": null, "captures": []},
      "usage":   {"report": {...}, "_state": {...}}     # owned by the hook
    }

On first touch it migrates and removes the legacy split files
(`config.yaml`, `state.yaml`, `usage.yaml`, `.usage-state.json`, `usage.md`).

Module API (hooks import this):

    from project_file import transaction
    with transaction(spec_dir) as data:
        data["usage"]["_state"] = ...

CLI (/spec calls this over Bash):

    project_file.py --project . get [dotted.key]
    project_file.py --project . set-language <chat> <artifacts>
    project_file.py --project . set-state <in_flight|next_suggested> <value>
    project_file.py --project . add-capture '<json object>'
    project_file.py --project . add-captures '<json array>'
    project_file.py --project . update-capture <seed-substring> <pending|consumed|dropped>
"""

import argparse
import fcntl
import json
import os
import re
import sys
from contextlib import contextmanager

FILE = "project.json"
LEGACY_REMOVE = ["config.yaml", "state.yaml", "usage.yaml", ".usage-state.json", "usage.md"]


def default():
    return {
        "version": 1,
        "language": {"chat": "en", "artifacts": "en"},
        "state": {"in_flight": None, "next_suggested": None, "captures": []},
        "usage": {"report": {}, "_state": {"sessions": {}}},
    }


# --- legacy migration (best-effort; the file shapes are ours) ----------------

def _scalar(text, key):
    m = re.search(rf"^\s*{key}:\s*(.+)$", text, re.MULTILINE)
    if not m:
        return None
    val = m.group(1).strip().strip('"').strip("'")
    return None if val in ("", "null", "~") else val


def _migrate_state_yaml(text):
    state = {"in_flight": None, "next_suggested": None, "captures": []}
    state["in_flight"] = _scalar(text, "in_flight")
    state["next_suggested"] = _scalar(text, "next_suggested")
    cur = None
    for line in text.splitlines():
        item = re.match(r"^\s*-\s*(\w+):\s*(.*)$", line)
        cont = re.match(r"^\s+(\w+):\s*(.*)$", line)
        if item:
            if cur:
                state["captures"].append(cur)
            cur = {item.group(1): item.group(2).strip().strip('"').strip("'")}
        elif cont and cur is not None:
            cur[cont.group(1)] = cont.group(2).strip().strip('"').strip("'")
    if cur:
        state["captures"].append(cur)
    return state


def _migrate(spec_dir, data):
    """Fold legacy split files into `data`; return paths to remove post-write."""
    removed = []
    cfg = os.path.join(spec_dir, "config.yaml")
    if os.path.isfile(cfg):
        text = open(cfg, encoding="utf-8").read()
        data["language"]["chat"] = _scalar(text, "chat") or data["language"]["chat"]
        data["language"]["artifacts"] = _scalar(text, "artifacts") or data["language"]["artifacts"]
        removed.append(cfg)
    st = os.path.join(spec_dir, "state.yaml")
    if os.path.isfile(st):
        data["state"] = _migrate_state_yaml(open(st, encoding="utf-8").read())
        removed.append(st)
    us = os.path.join(spec_dir, ".usage-state.json")
    if os.path.isfile(us):
        try:
            data["usage"]["_state"] = json.load(open(us, encoding="utf-8"))
        except (OSError, ValueError):
            pass
        removed.append(us)
    for stale in ("usage.yaml", "usage.md"):
        p = os.path.join(spec_dir, stale)
        if os.path.isfile(p):
            removed.append(p)
    return removed


# --- the coordinated transaction --------------------------------------------

@contextmanager
def transaction(spec_dir):
    """flock the project file, yield its parsed data, write it back atomically.

    One writer at a time; the read happens inside the lock so each caller sees
    the latest on-disk state before mutating its slice."""
    os.makedirs(spec_dir, exist_ok=True)
    path = os.path.join(spec_dir, FILE)
    fd = os.open(path, os.O_RDWR | os.O_CREAT, 0o644)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        raw = os.read(fd, os.fstat(fd).st_size).decode("utf-8") or ""
        if raw.strip():
            try:
                data = json.loads(raw)
            except ValueError:
                data = default()
            removed = []
        else:
            data = default()
            removed = _migrate(spec_dir, data)
        yield data
        body = (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
        os.ftruncate(fd, 0)
        os.lseek(fd, 0, 0)
        os.write(fd, body)
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)
    for p in removed:
        try:
            os.remove(p)
        except OSError:
            pass


def read(spec_dir):
    """Lock-free snapshot for readers (cold start, inject). Never mutates."""
    path = os.path.join(spec_dir, FILE)
    try:
        return json.loads(open(path, encoding="utf-8").read())
    except (OSError, ValueError):
        return default()


# --- CLI --------------------------------------------------------------------

def _dig(data, dotted):
    for part in dotted.split("."):
        data = data[part] if isinstance(data, dict) and part in data else None
        if data is None:
            break
    return data


def main():
    parser = argparse.ArgumentParser(description="Coordinate writes to .spec/project.json")
    parser.add_argument("--project", default=".", help="consumer project root (default: cwd)")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("get").add_argument("key", nargs="?", help="dotted path, e.g. language.chat")
    p_lang = sub.add_parser("set-language")
    p_lang.add_argument("chat")
    p_lang.add_argument("artifacts")
    p_state = sub.add_parser("set-state")
    p_state.add_argument("key", choices=["in_flight", "next_suggested"])
    p_state.add_argument("value")
    sub.add_parser("add-capture").add_argument("json", help="a capture object as JSON")
    sub.add_parser("add-captures").add_argument("json", help="a JSON array of capture objects")
    p_upd = sub.add_parser("update-capture")
    p_upd.add_argument("match", help="substring of the capture's seed")
    p_upd.add_argument("status", choices=["pending", "consumed", "dropped"])
    args = parser.parse_args()

    spec_dir = os.path.join(os.path.abspath(args.project), ".spec")

    if args.cmd == "get":
        data = read(spec_dir)
        print(json.dumps(_dig(data, args.key) if args.key else data, indent=2, ensure_ascii=False))
        return

    with transaction(spec_dir) as data:
        if args.cmd == "set-language":
            data["language"] = {"chat": args.chat, "artifacts": args.artifacts}
        elif args.cmd == "set-state":
            data["state"][args.key] = None if args.value in ("", "null") else args.value
        elif args.cmd == "add-capture":
            cap = json.loads(args.json)
            cap.setdefault("status", "pending")
            data["state"]["captures"].append(cap)
        elif args.cmd == "add-captures":
            caps = json.loads(args.json)
            if not isinstance(caps, list):
                parser.error("add-captures expects a JSON array")
            for cap in caps:
                cap.setdefault("status", "pending")
                data["state"]["captures"].append(cap)
        elif args.cmd == "update-capture":
            for cap in data["state"]["captures"]:
                if args.match in (cap.get("seed") or ""):
                    cap["status"] = args.status
    print(f"project.json updated: {args.cmd}")


if __name__ == "__main__":
    main()
