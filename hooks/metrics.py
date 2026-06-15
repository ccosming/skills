#!/usr/bin/env python3
"""Usage-ledger hook: keep a live, per-project cost ledger for the spec workflow.

Registered on four events so it runs reliably at least once per turn (a single
`Stop` is not enough — it can be missed on turns that end waiting on an
`AskUserQuestion`): `Stop` (normal turn end), `UserPromptSubmit` (every typed
prompt), `PostToolUse` (every tool call — covers a from-scratch session that
bootstraps `.spec/` mid-run and then grills entirely through `AskUserQuestion`,
where the only typed prompt predates `.spec/` and no `Stop` fires), and
`SessionStart` (startup/resume/compact — a catch-up that reconciles any turn a
missed trigger left unfolded). Each run folds the new transcript lines
into the project's ledger pair: `.spec/usage.yaml` — the report (cost per
`.spec/` artifact with the five token categories + cache hit, tool calls, user
prompts, assistant turns; time per artifact splitting effective work vs. human
wait vs. real wall-clock; a per-skill breakdown; a per-session log) — and
`.spec/.usage-state.json`, the machine state the next run resumes from. The
report is write-only (never parsed back), so no YAML library is needed.

Both are generated non-artifacts (like `config.yaml`); `/audit` skips them.
Written only when the project already has a `.spec/` directory — never created
in a non-spec project. A legacy `.spec/usage.md` ledger is migrated: its
embedded state seeds the new pair and the old file is removed.

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
import re
import sys
from datetime import datetime

FIELDS = ["input", "cache_read", "cache_creation", "output", "tools", "prompts", "turns"]
TIME = ["effective_sec", "idle_sec"]  # active work vs. human wait — look-back like tokens
OVERHEAD = "(overhead)"


def acc():
    return {k: 0 for k in FIELDS + TIME}


def add(into, src):
    for k in FIELDS + TIME:
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


def parse_ts(iso):
    """ISO event timestamp -> epoch seconds. Only deltas matter, so tz is moot."""
    try:
        return datetime.strptime(iso[:19], "%Y-%m-%dT%H:%M:%S").timestamp()
    except (ValueError, TypeError):
        return None


# --- incremental transcript folding ----------------------------------------

def fresh_snapshot():
    return {
        "date": "",
        "last_ts": "",  # full timestamp of the last folded event — staleness signal
        "cursor": 0,
        "active_skill": None,
        "pending_ask": False,  # last turn ended on an AskUserQuestion → next gap is wait
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
    # forward-compat: snapshots written by older versions lack newer fields
    snap.setdefault("last_ts", "")
    snap.setdefault("pending_ask", False)
    for a in [buffer, *artifacts.values(), *skills.values()]:
        for k in TIME:
            a.setdefault(k, 0)
    active = snap["active_skill"]
    prev = parse_ts(snap["last_ts"])  # previous event's time, for gap classification
    pending_ask = snap.get("pending_ask", False)
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

        # Time: charge the gap before this event to active work or human wait.
        # The event type owns the gap: a typed prompt (or an AskUserQuestion
        # answer) is the human deciding; an assistant turn or a tool result is
        # the system working.
        cur = parse_ts(ts)
        if cur is not None and prev is not None and cur >= prev:
            if etype == "user" and isinstance(msg.get("content"), str):
                buffer["idle_sec"] += cur - prev
            elif etype == "user":
                buffer["idle_sec" if pending_ask else "effective_sec"] += cur - prev
            elif etype == "assistant":
                buffer["effective_sec"] += cur - prev
        if cur is not None:
            prev = cur

        if etype == "user":
            if isinstance(msg.get("content"), str):
                buffer["prompts"] += 1
                active = None
            pending_ask = False
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
            turn_has_ask = False
            for c in msg.get("content") or []:
                if not isinstance(c, dict) or c.get("type") != "tool_use":
                    continue
                buffer["tools"] += 1
                turn["tools"] += 1
                name = c.get("name", "")
                inp = c.get("input") or {}
                if name == "Skill":
                    active = inp.get("skill")
                elif name == "AskUserQuestion":
                    turn_has_ask = True
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
            pending_ask = turn_has_ask
    snap["cursor"] += consumed
    snap["active_skill"] = active
    snap["pending_ask"] = pending_ask
    return snap


# --- state load / render ----------------------------------------------------

def load_state(state_path, legacy_md_path):
    """Resume from the JSON sidecar; fall back to a legacy usage.md ledger."""
    try:
        with open(state_path, "r", encoding="utf-8") as f:
            state = json.load(f)
        if isinstance(state.get("sessions"), dict):
            return state
    except (OSError, ValueError):
        pass
    # Legacy: state embedded in usage.md as an HTML-comment JSON block.
    try:
        text = open(legacy_md_path, "r", encoding="utf-8").read()
        start = text.index("<!-- spec-metrics-state v")  # any version — forward-compatible
        body = text[text.index("\n", start) + 1 : text.index("\n-->", start)]
        state = json.loads(body)
        if isinstance(state.get("sessions"), dict):
            return state
    except (OSError, ValueError):
        pass
    return None


def metric_entry(a):
    return {
        "input": a["input"], "cache_read": a["cache_read"],
        "cache_create": a["cache_creation"], "output": a["output"],
        "total": total_tokens(a), "cache_hit_pct": round(cache_hit(a), 1),
        "tools": a["tools"], "prompts": a["prompts"], "turns": a["turns"],
    }


def fmt_ts(iso):
    """ISO event timestamp -> 'YYYY-MM-DD HH:MM UTC' (the data's freshness)."""
    return (iso.replace("T", " ")[:16] + " UTC") if iso else "unknown"


def fmt_dur(sec):
    """Seconds -> compact duration: '10h 51m', '2m 04s', '45s'."""
    sec = int(sec)
    h, r = divmod(sec, 3600)
    m, s = divmod(r, 60)
    if h:
        return f"{h}h {m:02d}m"
    if m:
        return f"{m}m {s:02d}s"
    return f"{s}s"


def time_entry(a):
    eff, idle = a.get("effective_sec", 0), a.get("idle_sec", 0)
    return {"effective": fmt_dur(eff), "wait": fmt_dur(idle), "real": fmt_dur(eff + idle)}


# Write-only YAML emission for the known report shape: nested dicts of scalars.
# Strings are JSON-quoted (JSON scalars are valid YAML); keys are quoted only
# when they leave the safe set (e.g. "ccosming:clarify", "(overhead)").

SAFE_KEY = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_.\-]*$")


def yaml_scalar(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, float):
        return f"{v:.1f}"
    if isinstance(v, int):
        return str(v)
    return json.dumps(v, ensure_ascii=False)


def yaml_lines(node, indent=0):
    pad = "  " * indent
    out = []
    for k, v in node.items():
        key = k if SAFE_KEY.match(k) else json.dumps(k, ensure_ascii=False)
        if isinstance(v, dict):
            out.append(f"{pad}{key}:")
            out += yaml_lines(v, indent + 1)
        else:
            out.append(f"{pad}{key}: {yaml_scalar(v)}")
    return out


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
    items.append(("total", grand))

    session_log = {}
    for sid, s in sessions.items():
        row = acc()
        for a in s["artifacts"].values():
            add(row, a)
        add(row, s["buffer"])
        session_log[sid[:8]] = {
            "date": s["date"], "turns": row["turns"],
            "total_tokens": total_tokens(row),
            "effective": fmt_dur(row["effective_sec"]),
            "wait": fmt_dur(row["idle_sec"]),
        }

    doc = {
        "project": state["project"],
        "project_path": state["project_path"],
        "updated_through": fmt_ts(through),
        "session_count": len(sessions),
        "cost_per_artifact": {k: metric_entry(a) for k, a in items},
        "time_per_artifact": {k: time_entry(a) for k, a in items},
        "cost_per_skill": {
            k: metric_entry(a)
            for k, a in sorted(agg_skill.items(), key=lambda kv: total_tokens(kv[1]), reverse=True)
        },
        "sessions": session_log,
    }
    if not agg_skill:
        del doc["cost_per_skill"]

    header = [
        "# Plugin usage ledger — generated; do not edit by hand.",
        "# `updated_through` is the last turn folded in; if it lags wall-clock, a",
        "# hook fire was missed and the next prompt or session start reconciles.",
        "# Cost is look-back attributed: turns up to each .spec/ write charge to",
        "# that artifact; unattributed work shows under (overhead). Time: effective",
        "# = model + tool work; wait = human thinking or away; real = both.",
    ]
    return "\n".join(header + yaml_lines(doc)) + "\n"


# --- driver -----------------------------------------------------------------

def peek_meta(path):
    """Scan events until one carries the session id + project cwd."""
    sid = cwd = None
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    o = json.loads(line)
                except json.JSONDecodeError:
                    continue
                sid = sid or o.get("sessionId")
                cwd = cwd or o.get("cwd")
                if sid and cwd:
                    break
    except OSError:
        pass
    return sid, cwd


def ledger_paths(project_path):
    """(report, state, legacy) paths, or None outside a .spec project."""
    spec = os.path.join(project_path, ".spec")
    if not os.path.isdir(spec):
        return None
    return (os.path.join(spec, "usage.yaml"),
            os.path.join(spec, ".usage-state.json"),
            os.path.join(spec, "usage.md"))


def record(transcript, sid=None, project_path=None):
    p_sid, p_cwd = peek_meta(transcript)
    sid = sid or p_sid
    project_path = project_path or p_cwd or os.getcwd()
    paths = ledger_paths(project_path)
    if not paths or not sid:
        return None  # not a spec project, or unidentifiable session
    report_path, state_path, legacy_path = paths
    state = load_state(state_path, legacy_path) or {
        "version": 3,
        "project": os.path.basename(project_path.rstrip(os.sep)) or "root",
        "project_path": project_path,
        "sessions": {},
    }
    snap = state["sessions"].get(sid) or fresh_snapshot()
    fold(snap, transcript)
    state["sessions"][sid] = snap
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(render(state))
    if os.path.isfile(legacy_path):
        os.remove(legacy_path)  # migrated into the yaml + sidecar pair
    return report_path


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
