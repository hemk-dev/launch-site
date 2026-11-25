#!/usr/bin/env python3
"""Static SEO / accessibility / performance audit for a built website.

Works on the HTML output of any stack (Astro dist/, Next out/, Hugo public/,
Django-distill export, plain HTML...). Standard library only.

Usage:
    python3 audit_site.py <build-dir> [--base /subpath] [--json] [--strict]

Exit code 1 when any error is found (or any warning with --strict), so it can gate CI.

Besides per-page SEO/a11y basics it checks things that render as *blank* without any
console error, which screenshots are easy to misread: invalid SVG files (one bad
attribute makes a browser drop the whole sprite) and <use href> targets that don't exist.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET  # only parses the project's own build output; expat doesn't fetch external entities
from collections import defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

SKIP_DIRS = {"node_modules", ".git", "_next/static", "assets/vendor"}
SKIP_SCHEMES = ("mailto:", "tel:", "sms:", "javascript:", "data:", "#")
VOID_INTERACTIVE = {"a", "button"}
# HTML void elements never get an end tag, so they must not be pushed on the element stack
VOID_ELEMENTS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
                 "param", "source", "track", "wbr"}
SR_ONLY = {"sr-only", "visually-hidden", "screen-reader-text", "visuallyhidden"}
UNLABELLED_INPUT_TYPES = {"hidden", "submit", "button", "reset", "image"}


@dataclass
class PageInfo:
    path: str
    lang: str | None = None
    title: str = ""
    description: str | None = None
    viewport: bool = False
    refresh: bool = False
    canonical: str | None = None
    robots: str = ""
    og: dict = field(default_factory=dict)
    jsonld: list = field(default_factory=list)
    headings: list = field(default_factory=list)
    imgs: list = field(default_factory=list)
    links: list = field(default_factory=list)
    blocking_scripts: list = field(default_factory=list)
    unnamed_controls: list = field(default_factory=list)
    hidden_links: list = field(default_factory=list)
    name_mismatch: list = field(default_factory=list)
    unsafe_blank: list = field(default_factory=list)
    ids: list = field(default_factory=list)
    fields: list = field(default_factory=list)       # form controls: {id, desc, labelled}
    label_for: set = field(default_factory=set)
    svg_uses: list = field(default_factory=list)


class PageParser(HTMLParser):
    def __init__(self, info: PageInfo):
        super().__init__(convert_charrefs=True)
        self.info = info
        self.in_head = False
        self.in_title = False
        self.in_jsonld = False
        self.jsonld_buf: list[str] = []
        self.heading_stack: list[list] = []  # [level, text parts]
        # Track text/aria inside <a>/<button> to detect controls without accessible names
        self.control_stack: list[dict] = []
        self.label_depth = 0
        self.stack: list[tuple[str, bool]] = []  # (tag, starts a screen-reader-only subtree)

    def _sr_only(self) -> bool:
        return any(flag for _, flag in self.stack)

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        info = self.info
        if a.get("id"):
            info.ids.append(a["id"])
        if tag == "html":
            info.lang = a.get("lang") or None
        elif tag == "head":
            self.in_head = True
        elif tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = a.get("name", "").lower()
            prop = a.get("property", "").lower()
            if name == "description":
                info.description = a.get("content", "")
            elif name == "viewport":
                info.viewport = True
            elif name == "robots":
                info.robots = a.get("content", "").lower()
            if a.get("http-equiv", "").lower() == "refresh":
                info.refresh = True
            if prop.startswith("og:"):
                info.og[prop] = a.get("content", "")
        elif tag == "link":
            if "canonical" in a.get("rel", "").lower().split():
                info.canonical = a.get("href", "")
        elif tag == "script":
            if a.get("type", "").lower() == "application/ld+json":
                self.in_jsonld = True
                self.jsonld_buf = []
            elif (self.in_head and a.get("src") and "async" not in a and "defer" not in a
                  and "nomodule" not in a  # legacy polyfills: modern browsers never fetch them
                  and a.get("type", "").lower() != "module"):
                info.blocking_scripts.append(a["src"])
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.heading_stack.append([int(tag[1]), []])
        elif tag == "img":
            info.imgs.append(a)
            for ctl in self.control_stack:
                if a.get("alt"):
                    ctl["named"] = True
        elif tag == "label":
            self.label_depth += 1
            if a.get("for"):
                info.label_for.add(a["for"])
        elif tag == "use":
            href = a.get("href") or a.get("xlink:href")
            if href:
                info.svg_uses.append(href)
        if tag in ("input", "select", "textarea") and a.get("type", "").lower() not in UNLABELLED_INPUT_TYPES:
            info.fields.append({
                "id": a.get("id", ""),
                "desc": f"<{tag}{' name=' + a['name'] if a.get('name') else ''}{' id=' + a['id'] if a.get('id') else ''}>",
                "labelled": bool(self.label_depth or a.get("aria-label") or a.get("aria-labelledby") or a.get("title")),
            })
        if tag in VOID_INTERACTIVE:
            named = bool(a.get("aria-label") or a.get("aria-labelledby") or a.get("title"))
            self.control_stack.append({
                "tag": tag, "named": named, "href": a.get("href", ""), "aria_label": a.get("aria-label", ""),
                "text": [], "hidden": a.get("aria-hidden") == "true" and a.get("tabindex") == "-1",
            })
        if tag == "a":
            href = a.get("href")
            if href is not None:
                info.links.append(href)
            if a.get("target", "").lower() == "_blank":
                rel = a.get("rel", "").lower().split()
                if "noopener" not in rel and "noreferrer" not in rel:
                    info.unsafe_blank.append(href or "")
        if tag not in VOID_ELEMENTS:
            self.stack.append((tag, bool(SR_ONLY & set(a.get("class", "").split()))))

    def handle_startendtag(self, tag, attrs):
        # <tag ... /> — treat as start without a stacked element (common inside SVG)
        self.handle_starttag(tag, attrs)
        if tag not in VOID_ELEMENTS and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        # pop up to the matching element; tolerates unclosed <p>/<li> etc.
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
        if tag == "head":
            self.in_head = False
        elif tag == "title":
            self.in_title = False
        elif tag == "label" and self.label_depth:
            self.label_depth -= 1
        elif tag == "script" and self.in_jsonld:
            self.in_jsonld = False
            raw = "".join(self.jsonld_buf).strip()
            try:
                self.info.jsonld.append(json.loads(raw))
            except json.JSONDecodeError as exc:
                self.info.jsonld.append({"__invalid__": str(exc)})
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self.heading_stack:
            level, parts = self.heading_stack.pop()
            self.info.headings.append((level, " ".join("".join(parts).split())))
        if tag in VOID_INTERACTIVE and self.control_stack and self.control_stack[-1]["tag"] == tag:
            ctl = self.control_stack.pop()
            label = f"<{tag}{' href=' + ctl['href'] if ctl['href'] else ''}>"
            if not ctl["named"]:
                (self.info.hidden_links if ctl["hidden"] else self.info.unnamed_controls).append(label)
            visible = " ".join("".join(ctl["text"]).split()).lower()
            if ctl["aria_label"] and visible and visible not in " ".join(ctl["aria_label"].split()).lower():
                self.info.name_mismatch.append(f"{label} shows {visible[:40]!r} but aria-label is {ctl['aria_label'][:40]!r}")

    def handle_data(self, data):
        if self.in_title:
            self.info.title += data
        if self.in_jsonld:
            self.jsonld_buf.append(data)
        for h in self.heading_stack:
            h[1].append(data)
        if data.strip():
            sr_only = self._sr_only()
            for ctl in self.control_stack:
                ctl["named"] = True
                if not sr_only:
                    ctl["text"].append(data)


def find_html(root: Path) -> list[Path]:
    files = []
    for p in root.rglob("*.html"):
        rel = p.relative_to(root).as_posix()
        if any(rel.startswith(s + "/") or f"/{s}/" in rel for s in SKIP_DIRS):
            continue
        files.append(p)
    return sorted(files)


def resolve_internal(href: str, page: Path, root: Path, base: str) -> Path | None | bool:
    """Return True if the link target exists, False if missing, None if not checkable/external."""
    if not href or href.startswith(SKIP_SCHEMES):
        return None
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    if path.startswith("/"):
        if base and path.startswith(base):
            path = path[len(base):] or "/"
        target = root / path.lstrip("/")
    else:
        target = (page.parent / path).resolve()
    candidates = [target, target / "index.html"]
    if not target.suffix:
        candidates.append(target.with_suffix(".html"))
    return any(c.is_file() for c in candidates)


def page_url_path(rel: str, base: str) -> set[str]:
    """URL paths a built file can be served at (dir/index.html → /dir/ ; a.html → /a.html, /a)."""
    if rel == "index.html":
        paths = {"/"}
    elif rel.endswith("/index.html"):
        d = "/" + rel[: -len("index.html")]
        paths = {d, d.rstrip("/")}
    else:
        paths = {"/" + rel, "/" + rel[: -len(".html")]}
    return {base + p for p in paths}


def jsonld_types(data) -> list[str]:
    out: list[str] = []
    if isinstance(data, list):
        for d in data:
            out += jsonld_types(d)
    elif isinstance(data, dict):
        t = data.get("@type")
        if isinstance(t, list):
            out += [str(x) for x in t]
        elif t:
            out.append(str(t))
        for d in data.get("@graph", []) or []:
            out += jsonld_types(d)
    return out


def svg_ids(root: Path, cache: dict, rel: str) -> set[str] | str:
    """Ids defined in a local SVG file, or "missing" / "invalid"."""
    if rel not in cache:
        f = root / rel.lstrip("/")
        if not f.is_file():
            cache[rel] = "missing"
        else:
            try:
                cache[rel] = {el.get("id") for el in ET.parse(f).iter() if el.get("id")}
            except ET.ParseError:
                cache[rel] = "invalid"
    return cache[rel]


def sitemap_paths(root: Path) -> set[str] | None:
    files = list(root.glob("sitemap*.xml"))
    if not files:
        return None
    out = set()
    for f in files:
        out |= {urlparse(u).path for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", f.read_text(errors="replace"))}
    return out


def audit(root: Path, base: str) -> dict:
    pages: list[PageInfo] = []
    for f in find_html(root):
        info = PageInfo(path=f.relative_to(root).as_posix())
        try:
            PageParser(info).feed(f.read_text(encoding="utf-8", errors="replace"))
        except Exception as exc:  # malformed HTML should not stop the whole audit
            info.title = info.title or ""
            print(f"warn: could not fully parse {info.path}: {exc}", file=sys.stderr)
        pages.append((f, info))

    issues: list[dict] = []

    def add(level, page, msg):
        issues.append({"level": level, "page": page, "message": msg})

    # Every SVG in the build must be well-formed XML: browsers silently drop an invalid sprite,
    # so every <use> pointing into it renders as an empty box with no console error.
    for s in sorted(root.rglob("*.svg")):
        rel = s.relative_to(root).as_posix()
        if any(rel.startswith(d + "/") for d in SKIP_DIRS):
            continue
        try:
            ET.parse(s)
        except ET.ParseError as exc:
            add("error", rel, f"SVG is not valid XML ({exc}); browsers drop the whole file, so every icon/illustration from it renders blank")

    smap = sitemap_paths(root)
    svg_cache: dict = {}
    missing_svgs: dict = defaultdict(set)
    titles, descs = defaultdict(list), defaultdict(list)
    for f, p in pages:
        if p.refresh:
            add("info", p.path, "meta-refresh redirect stub skipped (prefer host-level 301s for static sites)")
            continue
        is_404 = p.path.endswith("404.html") or p.path.startswith("404/")
        noindex = "noindex" in p.robots
        title = " ".join(p.title.split())

        if not p.lang:
            add("error", p.path, "<html> has no lang attribute")
        if not p.viewport:
            add("error", p.path, "missing <meta name=viewport>")
        if not title:
            add("error", p.path, "missing or empty <title>")
        elif len(title) > 60:
            add("warn", p.path, f"title is {len(title)} chars (aim ≤ 60): {title!r}")
        if p.description is None or not p.description.strip():
            if not is_404:
                add("error", p.path, "missing meta description")
        else:
            n = len(p.description.strip())
            if n < 50 or n > 160:
                add("warn", p.path, f"meta description is {n} chars (aim 120–155)")
        if not is_404 and not noindex:
            if not p.canonical:
                add("warn", p.path, "no <link rel=canonical>")
            elif not p.canonical.startswith(("http://", "https://")):
                add("warn", p.path, f"canonical is not absolute: {p.canonical}")
            elif urlparse(p.canonical).path not in page_url_path(p.path, base):
                add("warn", p.path, f"canonical points to a different page: {p.canonical}")
            for key in ("og:title", "og:description", "og:image"):
                if not p.og.get(key):
                    add("warn", p.path, f"missing {key}")
            if title:
                titles[title].append(p.path)
            if p.description:
                descs[p.description.strip()].append(p.path)
            if smap is not None and not (page_url_path(p.path, base) & smap):
                add("info", p.path, "indexable page is not listed in the sitemap")
        if noindex and smap is not None and page_url_path(p.path, base) & smap:
            add("warn", p.path, "noindex page is listed in the sitemap")

        h1s = [h for h in p.headings if h[0] == 1]
        if len(h1s) != 1:
            add("error", p.path, f"expected exactly one <h1>, found {len(h1s)}")
        prev = 0
        for level, text in p.headings:
            if prev and level > prev + 1:
                add("warn", p.path, f"heading level skips h{prev} → h{level} ({text[:40]!r})")
            prev = level
            if not text:
                add("warn", p.path, f"empty <h{level}>")

        for d in p.jsonld:
            if isinstance(d, dict) and "__invalid__" in d:
                add("error", p.path, f"invalid JSON-LD: {d['__invalid__']}")
        if not is_404 and not noindex and not any(jsonld_types(d) for d in p.jsonld):
            add("warn", p.path, "no JSON-LD structured data")

        for i, img in enumerate(p.imgs):
            src = img.get("src") or img.get("data-src") or "(no src)"
            if "alt" not in img:
                add("error", p.path, f"<img> missing alt: {src}")
            if not (img.get("width") and img.get("height")) and "aspect-ratio" not in img.get("style", ""):
                if not src.endswith(".svg"):
                    add("warn", p.path, f"<img> without width/height (CLS risk): {src}")
            if i >= 2 and img.get("loading", "").lower() != "lazy" and img.get("fetchpriority") != "high":
                add("info", p.path, f"below-the-fold candidate not lazy-loaded: {src}")
            if img.get("loading", "").lower() == "lazy" and img.get("fetchpriority") == "high":
                add("warn", p.path, f"image is both lazy and fetchpriority=high: {src}")

        for href in sorted(set(p.svg_uses)):
            file_part, _, frag = href.partition("#")
            if not file_part:
                if frag and frag not in p.ids:
                    add("error", p.path, f"<use href={href}> points to an id not on the page (renders blank)")
                continue
            if urlparse(file_part).scheme or file_part.startswith("//"):
                continue
            target = file_part if file_part.startswith("/") else "/" + (f.parent.relative_to(root) / file_part).as_posix()
            if base and target.startswith(base):
                target = target[len(base):]
            ids = svg_ids(root, svg_cache, target)
            if ids == "missing":
                missing_svgs[file_part].add(p.path)
            elif ids == "invalid":
                add("error", p.path, f"<use href={href}>: {file_part} is not valid XML (renders blank)")
            elif frag and frag not in ids:
                add("error", p.path, f"<use href={href}>: no symbol with id {frag!r} in {file_part} (renders blank)")

        for c in p.blocking_scripts:
            add("warn", p.path, f"render-blocking script in <head> (add defer/async/module): {c}")
        for c in p.unnamed_controls:
            add("error", p.path, f"interactive element without accessible name: {c}")
        for c in sorted(set(p.hidden_links)):
            add("warn", p.path, f"aria-hidden duplicate link {c}: hidden from screen readers but still clickable; "
                                "prefer one real link per card (stretched-link pattern)")
        for c in sorted(set(p.name_mismatch)):
            add("warn", p.path, f"accessible name doesn't contain the visible text (breaks voice control, WCAG 2.5.3): {c}")
        for h in p.unsafe_blank:
            add("warn", p.path, f'target="_blank" without rel="noopener": {h}')

        for fld in p.fields:
            if not fld["labelled"] and not (fld["id"] and fld["id"] in p.label_for):
                add("error", p.path, f"form field without a label: {fld['desc']}")
        dup = sorted({i for i in p.ids if p.ids.count(i) > 1})
        if dup:
            add("error", p.path, f"duplicate id(s) (break labels, aria references and anchors): {', '.join(dup[:8])}")

        broken = set()
        for href in p.links:
            ok = resolve_internal(href, f, root, base)
            if ok is False:
                broken.add(href)
        for b in sorted(broken):
            add("error", p.path, f"broken internal link: {b}")

    for file_part, ps in sorted(missing_svgs.items()):
        add("warn", f"{len(ps)} page(s)", f"<use> references {file_part}, which is not in the build dir "
                                         "(fine if a server/CDN serves it; otherwise every use of it renders blank)")
    for t, ps in titles.items():
        if len(ps) > 1:
            add("warn", ", ".join(ps[:5]), f"duplicate <title> on {len(ps)} pages: {t!r}")
    for d, ps in descs.items():
        if len(ps) > 1:
            add("warn", ", ".join(ps[:5]), f"duplicate meta description on {len(ps)} pages")

    if not (root / "robots.txt").exists():
        add("warn", "(site)", "no robots.txt at the build root")
    if smap is None:
        add("warn", "(site)", "no sitemap*.xml at the build root")
    if not any(p.path.endswith("404.html") for _, p in pages):
        add("warn", "(site)", "no 404 page found")

    counts = defaultdict(int)
    for i in issues:
        counts[i["level"]] += 1
    return {"pages": len(pages), "counts": dict(counts), "issues": issues}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("build_dir", type=Path)
    ap.add_argument("--base", default="", help="base path the site is served under, e.g. /docs")
    ap.add_argument("--json", action="store_true", help="print machine-readable JSON")
    ap.add_argument("--strict", action="store_true", help="exit non-zero on warnings too")
    args = ap.parse_args()

    root = args.build_dir.resolve()
    if not root.is_dir():
        print(f"error: {root} is not a directory", file=sys.stderr)
        return 2
    result = audit(root, args.base.rstrip("/"))
    if result["pages"] == 0:
        print(f"error: no .html files found under {root} — point this at the build output", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        order = {"error": 0, "warn": 1, "info": 2}
        for i in sorted(result["issues"], key=lambda x: (order[x["level"]], x["page"])):
            print(f"[{i['level'].upper():5}] {i['page']}: {i['message']}")
        c = result["counts"]
        print(f"\nAudited {result['pages']} page(s): {c.get('error', 0)} error(s), "
              f"{c.get('warn', 0)} warning(s), {c.get('info', 0)} info")

    c = result["counts"]
    failed = c.get("error", 0) > 0 or (args.strict and c.get("warn", 0) > 0)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
