#!/usr/bin/env python3
"""WCAG contrast check for design tokens, in light and dark themes. Standard library only.

Usage:
    python3 contrast.py <tokens.css> [--pair fg:bg:min ...] [--json]

Reads CSS custom properties from the light `:root { … }` block and the dark override block
(`:root[data-theme="dark"] { … }`, falling back to a `prefers-color-scheme: dark` block),
resolves var() references and calc() inside oklch()/rgb(), and prints the contrast of each
semantic pair. Supports hex, rgb(), hsl()-free OKLCH, and nested var()s; color-mix() is
reported as "not evaluated". Exit 1 if any pair is below its minimum.

Default pairs (min ratio): body text 4.5, large text / UI boundaries / focus 3.0.
"""
from __future__ import annotations

import argparse
import ast
import json
import math
import operator
import re
import sys
from pathlib import Path

DEFAULT_PAIRS = [
    ("--color-text", "--color-bg", 4.5),
    ("--color-text", "--color-surface", 4.5),
    ("--color-text-muted", "--color-bg", 4.5),
    ("--color-text-muted", "--color-surface", 4.5),
    ("--color-primary", "--color-bg", 4.5),            # primary used as link/text colour
    ("--color-primary-contrast", "--color-primary", 4.5),
    ("--color-primary-contrast", "--color-primary-hover", 4.5),
    ("--color-accent-contrast", "--color-accent", 4.5),
    ("--color-accent-text", "--color-bg", 4.5),
    ("--color-section-brand-text", "--color-section-brand-bg", 4.5),
    ("--color-danger", "--color-bg", 4.5),            # error messages are text too
    ("--color-danger", "--color-surface", 4.5),
    ("--color-success", "--color-bg", 4.5),
    ("--color-link", "--color-bg", 4.5),
    ("--color-border-strong", "--color-bg", 3.0),      # form-control boundaries (WCAG 1.4.11)
    ("--color-focus", "--color-bg", 3.0),
]


def block(css: str, start: int) -> str:
    """Return the text inside the brace block that opens at or after `start`."""
    i = css.index("{", start)
    depth, j = 0, i
    while j < len(css):
        depth += {"{": 1, "}": -1}.get(css[j], 0)
        if depth == 0:
            return css[i + 1:j]
        j += 1
    return css[i + 1:]


def declarations(text: str) -> dict[str, str]:
    # strip nested blocks' selectors is unnecessary: we only read --custom-props at any depth
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"(--[\w-]+)\s*:\s*([^;{}]+);", text)}


def theme_vars(css: str) -> tuple[dict, dict]:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    # Spans of dark-only blocks: `@media (prefers-color-scheme: dark) { … }` and `[data-theme=dark]` rules.
    dark_spans, dark_override = [], {}
    for m in re.finditer(r"@media[^{]*prefers-color-scheme:\s*dark[^{]*\{", css):
        body = block(css, m.start())
        start = css.index("{", m.start()) + 1
        dark_spans.append((start, start + len(body)))
        dark_override.update(declarations(body))
    m = re.search(r":root\[data-theme=['\"]?dark['\"]?\]\s*\{", css)
    if m:
        dark_override.update(declarations(block(css, m.start())))  # explicit choice wins over the media query
    in_dark = lambda pos: any(a <= pos < b for a, b in dark_spans)
    light: dict[str, str] = {}
    for m in re.finditer(r"(?<![\w\]-]):root\s*(?:,\s*:root\[data-theme=['\"]?light['\"]?\])?\s*\{", css):
        if not in_dark(m.start()):  # a :root nested in the dark media query is the dark theme, not light
            light.update(declarations(block(css, m.start())))
    return light, {**light, **dark_override}


_OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv, ast.USub: operator.neg}


def arith(expr: str) -> float:
    """Safely evaluate a numeric expression like '0.14 * 0.15'."""
    def ev(n):
        if isinstance(n, ast.Constant) and isinstance(n.value, (int, float)):
            return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in _OPS:
            return _OPS[type(n.op)](ev(n.left), ev(n.right))
        if isinstance(n, ast.UnaryOp) and type(n.op) in _OPS:
            return _OPS[type(n.op)](ev(n.operand))
        raise ValueError(expr)
    return ev(ast.parse(expr.strip(), mode="eval").body)


def resolve(value: str, env: dict, depth: int = 0) -> str:
    if depth > 20:
        raise ValueError("var() cycle")
    def sub(m):
        name, fallback = m.group(1), m.group(2)
        if name in env:
            return resolve(env[name], env, depth + 1)
        if fallback is not None:
            return resolve(fallback, env, depth + 1)
        raise KeyError(name)
    while "var(" in value:
        value = re.sub(r"var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)", sub, value)
    # evaluate innermost calc(...) groups
    while "calc(" in value:
        value = re.sub(r"calc\(([^()]*)\)", lambda m: repr(arith(m.group(1))), value)
    return value


def to_linear_rgb(color: str) -> tuple[float, float, float]:
    c = color.strip().lower()
    if c.startswith("#"):
        h = c[1:]
        if len(h) in (3, 4):
            h = "".join(x * 2 for x in h[:3])
        rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in rgb)
    m = re.match(r"rgba?\(([^)]*)\)", c)
    if m:
        parts = re.split(r"[\s,/]+", m.group(1).strip())[:3]
        rgb = [float(p[:-1]) / 100 if p.endswith("%") else float(p) / 255 for p in parts]
        return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in rgb)
    m = re.match(r"oklch\(([^)]*)\)", c)
    if m:
        parts = m.group(1).split("/")[0].split()
        L = float(parts[0][:-1]) / 100 if parts[0].endswith("%") else float(parts[0])
        C = float(parts[1]) if parts[1] != "none" else 0.0
        H = float(parts[2].replace("deg", "")) if parts[2] != "none" else 0.0
        a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
        l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
        m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
        s_ = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
        rgb = (4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
               -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
               -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_)
        return tuple(min(1.0, max(0.0, x)) for x in rgb)  # clip to sRGB gamut
    if c in ("white", "black"):
        return (1.0, 1.0, 1.0) if c == "white" else (0.0, 0.0, 0.0)
    raise ValueError(f"unsupported colour: {color}")


def contrast(fg: str, bg: str) -> float:
    lum = lambda rgb: 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
    a, b = lum(to_linear_rgb(fg)), lum(to_linear_rgb(bg))
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tokens", type=Path)
    ap.add_argument("--pair", action="append", default=[], help="extra pair fg:bg:min, e.g. --color-link:--color-surface:4.5")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    light, dark = theme_vars(args.tokens.read_text())
    pairs = DEFAULT_PAIRS + [(p.rsplit(":", 2)[0], p.rsplit(":", 2)[1], float(p.rsplit(":", 2)[2])) for p in args.pair]
    rows, failed = [], 0
    for theme, env in (("light", light), ("dark", dark)):
        for fg, bg, minimum in pairs:
            if fg not in env or bg not in env:
                continue  # pair not defined in this token set
            try:
                ratio = contrast(resolve(env[fg], env), resolve(env[bg], env))
                ok = ratio >= minimum
                failed += not ok
                rows.append({"theme": theme, "fg": fg, "bg": bg, "ratio": round(ratio, 2), "min": minimum, "pass": ok})
            except (KeyError, ValueError) as exc:
                rows.append({"theme": theme, "fg": fg, "bg": bg, "ratio": None, "min": minimum, "pass": None, "note": f"not evaluated: {exc}"})
    if args.json:
        print(json.dumps(rows, indent=2))
    else:
        for r in rows:
            mark = "✓" if r["pass"] else ("?" if r["pass"] is None else "✗")
            ratio = f"{r['ratio']:>5}:1" if r["ratio"] else "  n/a  "
            print(f"{mark} {r['theme']:5} {ratio} (min {r['min']})  {r['fg']} on {r['bg']}{'  ' + r.get('note', '') if r.get('note') else ''}")
        print(f"\n{len(rows)} pair(s) checked, {failed} below minimum")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
