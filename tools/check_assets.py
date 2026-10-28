#!/usr/bin/env python3
"""
check_assets.py — verify that every asset referenced by docs/config.js exists,
and that PNG dimensions match the declared w/h.

Phase 3 archives the deck-only Phase 1 plot SVGs outside docs/, so the shipped
site has no committed figure files to check.

Run from the repository root (or anywhere):

    python3 tools/check_assets.py

Exit status: 0 = everything found and matching; 1 = a missing file, an unsafe
path, unreadable/invalid image, or a dimension mismatch (details on stderr).

Dependencies: Python standard library + Pillow (only for PNG dimensions).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
CONFIG = DOCS / "config.js"

try:
    from PIL import Image  # Pillow, available on this machine
except ImportError:  # pragma: no cover - reported if a size check is needed
    Image = None


# --------------------------------------------------------------------------
# Minimal brace-aware reader for the `assets: { … }` object in config.js
# --------------------------------------------------------------------------

def _find_matching_brace(text: str, open_index: int) -> int:
    """Index of the '}' matching text[open_index] == '{', or -1."""
    depth = 0
    quote = None
    escaped = False
    for i in range(open_index, len(text)):
        ch = text[i]
        if quote is not None:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'"):
            quote = ch
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
    return -1


def read_asset_entries(config_path: Path) -> list[dict]:
    """Return [{key, file, w, h}] for every `assets` entry that has a `file`."""
    text = config_path.read_text(encoding="utf-8")
    match = re.search(r"\bassets\s*:\s*\{", text)
    if not match:
        raise ValueError(f"no `assets: {{ … }}` block found in {config_path}")

    open_index = text.index("{", match.start())
    close_index = _find_matching_brace(text, open_index)
    if close_index < 0:
        raise ValueError(f"unbalanced `assets` block in {config_path}")

    body = text[open_index + 1:close_index]
    entries: list[dict] = []
    pos = 0
    while True:
        head = re.search(r"([A-Za-z_$][\w$]*)\s*:\s*\{", body[pos:])
        if not head:
            break
        entry_open = pos + head.end() - 1
        entry_close = _find_matching_brace(body, entry_open)
        if entry_close < 0:
            raise ValueError(f"unbalanced entry `{head.group(1)}` in {config_path}")

        entry_body = body[entry_open + 1:entry_close]
        file_match = re.search(r"\bfile\s*:\s*([\"'])(.*?)\1", entry_body, re.S)
        if file_match:
            entry = {
                "key": head.group(1),
                "file": file_match.group(2),
                "w": None,
                "h": None,
            }
            w_match = re.search(r"\bw\s*:\s*(\d+)", entry_body)
            h_match = re.search(r"\bh\s*:\s*(\d+)", entry_body)
            if w_match:
                entry["w"] = int(w_match.group(1))
            if h_match:
                entry["h"] = int(h_match.group(1))
            entries.append(entry)

        # Jump past this whole entry so nested keys are not mistaken for assets.
        pos = entry_close + 1
    return entries


# --------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------

def resolve_under_docs(rel_path: str) -> Path:
    """Resolve an asset path and refuse absolute paths / paths escaping docs/."""
    rel = Path(rel_path)
    if rel.is_absolute():
        raise ValueError(f"absolute path not allowed: {rel_path}")
    target = (DOCS / rel).resolve()
    docs_resolved = DOCS.resolve()
    if target != docs_resolved and docs_resolved not in target.parents:
        raise ValueError(f"path escapes docs/: {rel_path}")
    return target


def check_asset(entry: dict, errors: list[str]) -> str:
    label = entry["key"]
    try:
        target = resolve_under_docs(entry["file"])
    except ValueError as exc:
        errors.append(f"{label}: {exc}")
        return f"FAIL {label}: {exc}"

    shown = target.relative_to(ROOT).as_posix()
    if not target.is_file():
        msg = f"{label}: missing file {shown} (declared in docs/config.js)"
        errors.append(msg)
        return f"FAIL {msg}"

    expected_w, expected_h = entry["w"], entry["h"]
    if target.suffix.lower() != ".png":
        extra = f" ({expected_w}x{expected_h} declared)" if expected_w or expected_h else ""
        return f"OK   {label:<18} {shown}{extra}"

    if Image is None:
        if expected_w or expected_h:
            msg = f"{label}: cannot verify PNG size, Pillow is not installed"
            errors.append(msg)
            return f"FAIL {msg}"
        return f"OK   {label:<18} {shown}"

    try:
        with Image.open(target) as img:
            actual_w, actual_h = img.size
            mode = img.mode
    except OSError as exc:
        msg = f"{label}: unreadable PNG {shown}: {exc}"
        errors.append(msg)
        return f"FAIL {msg}"

    problems = []
    if expected_w is not None and actual_w != expected_w:
        problems.append(f"width {actual_w} != {expected_w}")
    if expected_h is not None and actual_h != expected_h:
        problems.append(f"height {actual_h} != {expected_h}")

    if problems:
        msg = f"{label}: {shown} is {actual_w}x{actual_h}: " + "; ".join(problems)
        errors.append(msg)
        return f"FAIL {msg}"

    expected = ""
    if expected_w is not None and expected_h is not None:
        expected = f" (expected {expected_w}x{expected_h})"
    return f"OK   {label:<18} {shown}  {actual_w}x{actual_h} {mode}{expected}"


def main() -> int:
    print(f"Checking assets for {ROOT.name}")
    if not CONFIG.is_file():
        print(f"FAIL config not found: {CONFIG}", file=sys.stderr)
        return 1

    try:
        entries = read_asset_entries(CONFIG)
    except (ValueError, OSError) as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        return 1

    errors: list[str] = []
    print(f"config.js assets ({len(entries)}):")
    for entry in entries:
        print("  " + check_asset(entry, errors))

    if errors:
        sys.stdout.flush()
        print(f"\n{len(errors)} problem(s):", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print(f"\nAll {len(entries)} asset(s) OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
