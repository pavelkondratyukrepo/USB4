#!/usr/bin/env python3
"""Assemble src/ into a single self-contained page.

  index.html     full HTML document (open locally, host anywhere)
  artifact.html  same page without the document skeleton (for claude.ai Artifacts)
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
SCRIPTS = ["core.js", "board.js", "figs-a.js", "figs-b.js", "figs-c.js", "sim.js", "master.js", "app.js"]
FONTS = ("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800"
         "&family=JetBrains+Mono:wght@400;700&display=swap")

head = (
    "<title>USB-C Dock Failure Explained</title>\n"
    '<meta name="claude:viewport-fit-sides" content="cover">\n'
    '<meta name="description" content="Interactive engineering training module: why a USB-C dock kept charging '
    'but lost USB and displays, and why a long power-button hold fixed it.">\n'
    f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="{FONTS}">\n'
    f"<style>\n{(SRC / 'styles.css').read_text()}\n</style>\n"
)
body = (SRC / "page.html").read_text()
js = "\n".join(f"/* ===== {n} ===== */\n" + (SRC / n).read_text() for n in SCRIPTS)
fragment = f"{head}{body}\n<script>\n{js}\n</script>\n"

(ROOT / "artifact.html").write_text(fragment)
(ROOT / "index.html").write_text(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    f"{head}</head>\n<body>\n{body}\n<script>\n{js}\n</script>\n</body>\n</html>\n"
)
print(f"index.html {len((ROOT / 'index.html').read_text()) // 1024} KB")
