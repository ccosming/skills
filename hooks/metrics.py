#!/usr/bin/env python3
"""Usage-ledger hook: keep a live, per-project cost ledger for the spec workflow.

Registered on three events so it runs reliably at least once per turn (a single
`Stop` is not enough — it can be missed on turns that end waiting on an
`AskUserQuestion`): `Stop` (normal turn end), `UserPromptSubmit` (every typed
prompt), and `SessionStart` (startup/resume/compact — a catch-up that reconciles
any turn a missed trigger left unfolded). Each run folds the new transcript lines
into the project's `.spec/usage.md`: a cost ledger with one row per `.spec/`
artifact (the five token categories + cache hit, plus tool calls, user prompts,
assistant turns), a per-skill breakdown for plugin optimization, and a per-session
log.

It is a generated non-artifact (like `config.yaml`); `/audit` skips it and the
formatter leaves it alone. Written only when the project already has a `.spec/`
directory — never created in a non-spec project.

Per-turn cost is kept cheap by INCREMENTAL parsing: each session stores a byte
cursor and only the new transcript lines are read. The cursor self-heals — the
next run folds everything since the stored cursor — and `Updated through` reports
the timestamp of the last turn folded in, so a stale ledger shows itself instead
of looking current. Work not yet tied to a `.spec/` write is shown provisionally
under `(overhead)`; a later write reattributes it (look-back heuristic). Cache-read
tokens track conversation length more than artifact effort.

Also runnable directly for testing:

    metrics.py [/path/to/transcript.jsonl ...]
"""

import json
import os
import sys

FIELDS = ["input", "cache_read", "cache_creation", "output", "tools", "prompts", "turns"]
OVERHEAD = "(overhead)"


def acc():
    return {k: 0 for k in FIELDS}


def add(into, src):
    for k in FIELDS:
        into[k] = into.get(k, 0) + src.get(k, 0)


def total_tokens(a):
    return a["input"] + a["cache_read"] + a["cache_creation"] + a["output"]


def cache_hit(a):
    ctx = a["input"] + a["cache_read"] + a["cache_creation"]
    return (100.0 * a["cache_read"] / ctx) if ctx else 0.0


def spec_rel(path):
    marker = os.sep + ".spec" + os.sep
    if marker in path and path.endswith(".md"):
        return path.split(marker, 1)[1]
    return None


# --- incremental transcript folding ----------------------------------------

def fresh_snapshot():
    return {
        "date": "",
        "last_ts": "",  # full timestamp of the last folded event — staleness signal
        "cursor": 0,
        "active_skill": None,
        "buffer": acc(),  # pending look-back work, shown as provisional overhead
        "artifacts": {},  # rel path -> acc (flushed)
        "skills": {},  # skill -> acc
    }


def fold(snap, path):
    """Read transcript bytes past snap['cursor'] and fold complete lines in."""
    with open(path, "rb") as f:
        f.seek(snap["cursor"])
        data = f.read()
    parts = data.split(b"\n")  # parts[-1] is the trailing (incomplete) remainder
    buffer, artifacts, skills = snap["buffer"], snap["artifacts"], snap["skills"]
    active = snap["active_skill"]
    consumed = 0
    for raw in parts[:-1]:
        consumed += len(raw) + 1
        line = raw.decode("utf-8", "replace").strip()
        if not line:
            continue
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            continue
        ts = o.get("timestamp") or ""
        snap["date"] = ts[:10] or snap["date"]
        snap["last_ts"] = ts or snap["last_ts"]
        etype = o.get("type")
        msg = o.get("message") or {}
        if etype == "user":
            if isinstance(msg.get("content"), str):
                buffer["prompts"] += 1
                active = None
        elif etype == "assistant":
            buffer["turns"] += 1
            u = msg.get("usage") or {}
            turn = {
                "input": u.get("input_tokens", 0),
                "cache_read": u.get("cache_read_input_tokens", 0),
                "cache_creation": u.get("cache_creation_input_tokens", 0),
                "output": u.get("output_tokens", 0),
                "tools": 0,
                "prompts": 0,
                "turns": 1,
            }
            buffer["input"] += turn["input"]
            buffer["cache_read"] += turn["cache_read"]
            buffer["cache_creation"] += turn["cache_creation"]
            buffer["output"] += turn["output"]
            written = []
            for c in msg.get("content") or []:
                if not isinstance(c, dict) or c.get("type") != "tool_use":
                    continue
                buffer["tools"] += 1
                turn["tools"] += 1
                name = c.get("name", "")
                inp = c.get("input") or {}
                if name == "Skill":
                    active = inp.get("skill")
                elif name in ("Write", "Edit", "MultiEdit"):
                    rel = spec_rel(inp.get("file_path", "") or "")
                    if rel:
                        written.append(rel)
            if active:
                skills.setdefault(active, acc())
                add(skills[active], turn)
            if written:  # flush look-back buffer to the artifact written here
                artifacts.setdefault(written[0], acc())
                add(artifacts[written[0]], buffer)
                buffer.update(acc())
    snap["cursor"] += consumed
    snap["active_skill"] = active
    return snap


# --- state load / render ----------------------------------------------------

def load_state(path):
    if not os.path.isfile(path):
        return None
    try:
        text = open(path, "r", encoding="utf-8").read()
        start = text.index("<!-- spec-metrics-state v2")
        body = text[text.index("\n", start) + 1 : text.index("\n-->", start)]
        state = json.loads(body)
        if isinstance(state.get("sessions"), dict):
            return state
    except (ValueError, json.JSONDecodeError):
        pass
    return None


def metric_table(rows):
    header = ["Item", "Input", "Cache read", "Cache create", "Output", "Total",
              "Cache hit", "Tools", "Prompts", "Turns"]
    out = ["| " + " | ".join(header) + " |", "| " + " | ".join(["---"] * 10) + " |"]
    for label, a in rows:
        out.append("| " + " | ".join([
            label, f"{a['input']:,}", f"{a['cache_read']:,}",
            f"{a['cache_creation']:,}", f"{a['output']:,}", f"{total_tokens(a):,}",
            f"{cache_hit(a):.1f}%", f"{a['tools']:,}", f"{a['prompts']:,}",
            f"{a['turns']:,}",
        ]) + " |")
    return out


def fmt_ts(iso):
    """ISO event timestamp -> 'YYYY-MM-DD HH:MM UTC' (the data's freshness)."""
    return (iso.replace("T", " ")[:16] + " UTC") if iso else "unknown"


def render(state):
    sessions = state["sessions"]
    through = max((s.get("last_ts", "") for s in sessions.values()), default="")

    agg_art, agg_skill, overhead = {}, {}, acc()
    for s in sessions.values():
        for k, a in s["artifacts"].items():
            agg_art.setdefault(k, acc())
            add(agg_art[k], a)
        for k, a in s["skills"].items():
            agg_skill.setdefault(k, acc())
            add(agg_skill[k], a)
        add(overhead, s["buffer"])  # provisional, not yet attributed

    grand = acc()
    for a in agg_art.values():
        add(grand, a)
    add(grand, overhead)

    items = sorted(agg_art.items(), key=lambda kv: total_tokens(kv[1]), reverse=True)
    if any(overhead[k] for k in FIELDS):
        items.append((OVERHEAD, overhead))
    items.append(("**Total**", grand))

    out = [
        f"# Plugin usage — {state['project']}",
        "",
        f"Updated through: {fmt_ts(through)} · Sessions: {len(sessions)} · "
        f"Project: `{state['project_path']}`",
        "",
        "Live ledger. `Updated through` is the last turn folded in; if it lags "
        "wall-clock, a hook fire was missed and the next prompt or session start "
        "reconciles. Per-artifact cost is a look-back heuristic (turns up to each "
        "`.spec/` write charge to that artifact); work not yet attributed shows "
        "under `(overhead)`. Cache-read scales with conversation length.",
        "",
        "## Cost per artifact",
        "",
    ]
    out += metric_table(items)

    if agg_skill:
        sk = sorted(agg_skill.items(), key=lambda kv: total_tokens(kv[1]), reverse=True)
        out += ["", "## Cost per skill", ""]
        out += metric_table(sk)

    out += ["", "## Sessions", "", "| Session | Date | Turns | Total tokens |",
            "| --- | --- | --- | --- |"]
    for sid, s in sessions.items():
        row = acc()
        for a in s["artifacts"].values():
            add(row, a)
        add(row, s["buffer"])
        out.append(f"| {sid[:8]} | {s['date']} | {row['turns']:,} | {total_tokens(row):,} |")

    out += [
        "",
        "<!-- spec-metrics-state v2 — generated, do not edit by hand",
        json.dumps(state, ensure_ascii=False),
        "-->",
        "",
    ]
    return "\n".join(out)


# --- driver -----------------------------------------------------------------

def peek_meta(path):
    """First valid event gives session id + project cwd."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                o = json.loads(line)
                return o.get("sessionId"), o.get("cwd")
    except (OSError, json.JSONDecodeError):
        pass
    return None, None


def usage_path(project_path):
    spec = os.path.join(project_path, ".spec")
    return os.path.join(spec, "usage.md") if os.path.isdir(spec) else None


def record(transcript, sid=None, project_path=None):
    p_sid, p_cwd = peek_meta(transcript)
    sid = sid or p_sid
    project_path = project_path or p_cwd or os.getcwd()
    path = usage_path(project_path)
    if not path or not sid:
        return None  # not a spec project, or unidentifiable session
    state = load_state(path) or {
        "version": 2,
        "project": os.path.basename(project_path.rstrip(os.sep)) or "root",
        "project_path": project_path,
        "sessions": {},
    }
    snap = state["sessions"].get(sid) or fresh_snapshot()
    fold(snap, transcript)
    state["sessions"][sid] = snap
    with open(path, "w", encoding="utf-8") as f:
        f.write(render(state))
    return path


def main():
    if len(sys.argv) > 1:
        for p in sys.argv[1:]:
            print(record(p) or "(skipped: no .spec/ in project)")
        return
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        transcript = payload.get("transcript_path")
        if transcript and os.path.isfile(transcript):
            record(transcript, payload.get("session_id"), payload.get("cwd"))
    except Exception:
        pass  # never disrupt the turn
    sys.exit(0)


if __name__ == "__main__":
    main()
