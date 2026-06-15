#!/usr/bin/env python3
"""PostToolUse formatter for `.spec/` Markdown artifacts.

Runs after Write/Edit/MultiEdit. Reads the hook payload from stdin; when the
touched file is Markdown under a `.spec/` directory, it normalizes the file in
place:

- aligns GFM table columns,
- wraps prose to a fixed width, keeping links and inline-code spans atomic,
- normalizes blank-line spacing and trims trailing whitespace,
- leaves fenced code blocks and YAML frontmatter verbatim.

Pure standard library. Any failure leaves the file untouched and exits 0, so the
session is never disrupted. Also runnable directly on paths for testing:

    format_spec.py path/to/file.md [more.md ...]
"""

import json
import os
import re
import sys

WIDTH = 80

FENCE_RE = re.compile(r"^(\s*)(`{3,}|~{3,})")
HEADING_RE = re.compile(r"^#{1,6}\s")
LIST_RE = re.compile(r"^(\s*)([-*+]|\d+[.)])(\s+)(.*)$")
QUOTE_RE = re.compile(r"^\s*>")
# inline-code span | markdown link | bare non-space run — first two stay atomic.
TOKEN_RE = re.compile(r"`[^`]*`|\[[^\]]*\]\([^)]*\)|\S+")


def is_delim(line):
    """A GFM table delimiter row: only pipes, colons, dashes, spaces."""
    s = line.strip()
    if "|" not in s or "-" not in s:
        return False
    return all(c in "|:- " for c in s)


def is_table_start(lines, i):
    return "|" in lines[i] and i + 1 < len(lines) and is_delim(lines[i + 1])


def split_row(row):
    s = row.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|"):
        s = s[:-1]
    return [c.strip() for c in re.split(r"(?<!\\)\|", s)]


def col_align(cell):
    c = cell.strip()
    left, right = c.startswith(":"), c.endswith(":")
    if left and right:
        return "c"
    if right:
        return "r"
    if left:
        return "l"
    return None


def format_table(rows):
    header = split_row(rows[0])
    delim = split_row(rows[1])
    body = [split_row(r) for r in rows[2:]]
    ncol = max([len(header), len(delim)] + [len(b) for b in body])
    aligns = [col_align(delim[k]) if k < len(delim) else None for k in range(ncol)]

    def norm(cells):
        return cells + [""] * (ncol - len(cells))

    widths = [3] * ncol
    for cells in [norm(header)] + [norm(b) for b in body]:
        for k in range(ncol):
            widths[k] = max(widths[k], len(cells[k]))

    def cell(val, k):
        a, w = aligns[k], widths[k]
        if a == "r":
            return val.rjust(w)
        if a == "c":
            return val.center(w)
        return val.ljust(w)

    def row(cells):
        cells = norm(cells)
        return "| " + " | ".join(cell(cells[k], k) for k in range(ncol)) + " |"

    def delimiter():
        parts = []
        for k in range(ncol):
            w, a = widths[k], aligns[k]
            if a == "c":
                parts.append(":" + "-" * (w - 2) + ":")
            elif a == "r":
                parts.append("-" * (w - 1) + ":")
            elif a == "l":
                parts.append(":" + "-" * (w - 1))
            else:
                parts.append("-" * w)
        return "| " + " | ".join(parts) + " |"

    return [row(header), delimiter()] + [row(b) for b in body]


def wrap_unit(first_prefix, cont_prefix, text, width):
    tokens = TOKEN_RE.findall(text)
    if not tokens:
        return [first_prefix.rstrip()]
    lines, cur, has_word = [], first_prefix, False
    for tok in tokens:
        candidate = cur + (" " if has_word else "") + tok
        if not has_word or len(candidate) <= width:
            cur, has_word = candidate, True
        else:
            lines.append(cur)
            cur, has_word = cont_prefix + tok, True
    lines.append(cur)
    return lines


def reflow_block(block_lines, width):
    """Reflow a run of prose/list lines. Blockquotes and indented (4+) blocks
    pass through verbatim — only their trailing whitespace is trimmed."""
    units = []  # ['marker', first_prefix, cont_prefix, text] or ['raw', line]
    for line in block_lines:
        if QUOTE_RE.match(line):
            units.append(["raw", line.rstrip()])
            continue
        m = LIST_RE.match(line)
        if m:
            indent, marker, _, rest = m.groups()
            prefix = indent + marker + " "
            units.append(["marker", prefix, " " * len(prefix), rest])
            continue
        stripped = line.lstrip()
        indent = line[: len(line) - len(stripped)]
        if (
            units
            and units[-1][0] == "marker"
            and not (len(indent) >= 4 and units[-1][1].strip() == "")
        ):
            units[-1][3] += " " + stripped
        elif len(indent) >= 4:
            units.append(["raw", line.rstrip()])
        else:
            units.append(["marker", indent, indent, stripped])

    out = []
    for u in units:
        if u[0] == "raw":
            out.append(u[1])
        else:
            out.extend(wrap_unit(u[1], u[2], u[3], width))
    return out


def parse_blocks(lines):
    """Split into (type, lines) blocks. Blank lines are delimiters (dropped)."""
    blocks, i, n = [], 0, len(lines)
    if n and lines[0].strip() == "---":
        j = 1
        while j < n and lines[j].strip() != "---":
            j += 1
        if j < n:
            blocks.append(("frontmatter", lines[: j + 1]))
            i = j + 1
    while i < n:
        line = lines[i]
        if line.strip() == "":
            i += 1
            continue
        if FENCE_RE.match(line):
            fence = FENCE_RE.match(line).group(2)
            char, length = fence[0], len(fence)
            close = re.compile(r"^\s*" + re.escape(char) + "{" + str(length) + r",}\s*$")
            code = [line]
            i += 1
            while i < n:
                code.append(lines[i])
                done = close.match(lines[i])
                i += 1
                if done:
                    break
            blocks.append(("code", code))
            continue
        if HEADING_RE.match(line):
            blocks.append(("heading", [line.rstrip()]))
            i += 1
            continue
        if is_table_start(lines, i):
            tbl = [lines[i], lines[i + 1]]
            i += 2
            while i < n and "|" in lines[i] and lines[i].strip() != "":
                if FENCE_RE.match(lines[i]) or HEADING_RE.match(lines[i]):
                    break
                tbl.append(lines[i])
                i += 1
            blocks.append(("table", tbl))
            continue
        prose = []
        while i < n and lines[i].strip() != "":
            if (
                FENCE_RE.match(lines[i])
                or HEADING_RE.match(lines[i])
                or is_table_start(lines, i)
            ):
                break
            prose.append(lines[i])
            i += 1
        blocks.append(("prose", prose))
    return blocks


def format_markdown(text, width=WIDTH):
    if not text.strip():
        return text
    blocks = parse_blocks(text.split("\n"))
    out = []
    for idx, (typ, blk) in enumerate(blocks):
        if idx > 0:
            out.append("")
        if typ in ("frontmatter", "code"):
            out.extend(blk)
        elif typ == "heading":
            out.extend(blk)
        elif typ == "table":
            out.extend(format_table(blk))
        else:
            out.extend(reflow_block(blk, width))
    return "\n".join(out).rstrip("\n") + "\n"


def format_file(path):
    with open(path, "r", encoding="utf-8") as f:
        original = f.read()
    formatted = format_markdown(original)
    if formatted != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(formatted)


def is_spec_markdown(path):
    # Skip legacy usage.md ledgers (now usage.yaml): their embedded JSON state
    # must not be wrapped.
    if os.path.basename(path) == "usage.md":
        return False
    return path.endswith(".md") and (os.sep + ".spec" + os.sep) in path


def main():
    # Direct mode: explicit paths (testing).
    if len(sys.argv) > 1:
        for path in sys.argv[1:]:
            format_file(path)
        return
    # Hook mode: payload on stdin.
    try:
        payload = json.loads(sys.stdin.read())
        path = payload.get("tool_input", {}).get("file_path", "")
        if path and is_spec_markdown(path) and os.path.isfile(path):
            format_file(path)
    except Exception:
        pass  # never disrupt the session
    sys.exit(0)


if __name__ == "__main__":
    main()
