#!/usr/bin/env python3
"""Génère tokens/gst-tokens.json (format W3C DTCG) à partir de tokens/gst-tokens.css.
Usage : python3 tools/build-tokens-json.py   (depuis la racine du design system)
Le CSS reste la source de vérité ; le JSON sert à Figma (Tokens Studio) et Style Dictionary."""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
css = (ROOT / "tokens/gst-tokens.css").read_text(encoding="utf-8")
css_nc = re.sub(r"/\*.*?\*/", "", css, flags=re.S)

def block(selector_regex):
    m = re.search(selector_regex + r"\s*\{(.*?)\n\}", css_nc, flags=re.S)
    if not m: return {}
    return dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", m.group(1)))

base = block(r"\n:root")
jour = block(r":root,\[data-theme=\"jour\"\],\[data-theme=\"soleil\"\]")
nuit = block(r"\[data-theme=\"nuit\"\]")
soleil = block(r"\n\[data-theme=\"soleil\"\]")

def path_for(name):
    n = name[len("--gst-"):] if name.startswith("--gst-") else None
    if n is None: return None
    for pre, grp in [("teal-", "color.teal"), ("red-", "color.red"), ("eclair", "color.eclair"), ("forest", "color.forest"),
                     ("ink", "color.ink"), ("sky-", "sky"), ("dur-", "duration"), ("ease-", "easing"), ("stagger-", "stagger"),
                     ("space-", "space"), ("radius-", "radius"), ("fs-", "fontSize"), ("lh-", "lineHeight"), ("ls-", "letterSpacing"),
                     ("fw-", "fontWeight"), ("font-", "fontFamily"), ("z-", "zIndex"), ("touch-", "touch"), ("grid-", "grid"),
                     ("frame-", "frame"), ("spring-seat-", "spring.seat")]:
        if n.startswith(pre):
            key = n[len(pre):] if pre.endswith("-") else (n[len(pre):].lstrip("-") or "base")
            return grp + "." + (key or "base")
    if n in ("cream", "paper", "stone", "sand", "white", "black"): return "color.neutral." + n
    return None

def typ(path, value):
    if path.startswith("color") or path.startswith("sky") or value.startswith("#") or value.startswith("rgba"): return "color"
    if path.startswith("duration") or path.startswith("stagger"): return "duration"
    if path.startswith("easing"): return "cubicBezier"
    if path.startswith("fontFamily"): return "fontFamily"
    if path.startswith("fontWeight"): return "fontWeight"
    if path.startswith("zIndex") or path.startswith("lineHeight") or path.startswith("spring") or path.startswith("grid.cols"): return "number"
    return "dimension"

def ref(value):
    m = re.fullmatch(r"var\((--[\w-]+)\)", value.strip())
    if m:
        p = path_for(m.group(1))
        if p: return "{" + p + "}"
    return value.strip()

def put(tree, path, leaf):
    cur = tree
    parts = path.split(".")
    for k in parts[:-1]: cur = cur.setdefault(k, {})
    cur[parts[-1]] = leaf

out = {"$description": "GST GOVERNMENT — tokens web (généré depuis tokens/gst-tokens.css, ne pas éditer à la main)"}
for name, value in base.items():
    p = path_for(name)
    if not p: continue
    v = value.strip()
    if p.startswith("easing"):
        nums = [float(x) for x in re.findall(r"-?\d*\.?\d+", v[v.index("("):])]
        put(out, p, {"$type": "cubicBezier", "$value": nums}); continue
    put(out, p, {"$type": typ(p, v), "$value": ref(v)})
put(out, "shadow.lift", {"$type": "shadow", "$value": {"offsetX": "0px", "offsetY": "24px", "blur": "48px", "spread": "-24px", "color": "rgba(3,39,38,.45)"}})
put(out, "spring.seat.$description", "Ressort : stiffness 420, damping 28, mass 0.8 — échantillonné par gst-motion.js")

def semantic(block_, inherit=None):
    res = {}
    src = dict(inherit or {}); src.update(block_)
    for name, value in src.items():
        if not name.startswith("--gst-"): continue
        key = name[len("--gst-"):]
        v = value.strip()
        res[key] = {"$type": "color" if ("#" in v or "rgba" in v or "var(--gst-" in v and not key.startswith(("hairline", "border", "rule", "tag-weight", "focus"))) else "other", "$value": ref(v)}
    return res
out["semantic"] = {"jour": semantic(jour), "nuit": semantic(nuit, jour), "soleil": semantic(soleil, jour)}
(ROOT / "tokens/gst-tokens.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("tokens.json :", sum(1 for _ in re.finditer(r'"\$value"', json.dumps(out))), "valeurs")
