#!/usr/bin/env python3
"""Bundle the app into one self-contained HTML page (used for the claude.ai preview link).

    python3 tools/build-preview.py [output.html]

Inlines the CSS and all modules into a single <script type="module">, and loads Three.js
from the jsDelivr CDN instead of vendor/. The installable app itself does not need this.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'morning-move.html')
MODULES = ['skin', 'avatar', 'stage', 'exercises', 'routines', 'plan', 'audio', 'app']  # dependency order


def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()


html = read('index.html')
body = html[html.index('<body>') + 6:html.index('</body>')]
body = re.sub(r'\s*<script type="module" src="js/app.js"></script>', '', body)

js = ''
for m in MODULES:
    s = read(f'js/{m}.js')
    s = re.sub(r"^import \* as THREE from '../vendor/three.module.min.js';\n", '', s, flags=re.M)
    s = re.sub(r"^import .* from '\./[a-z]+\.js';\n", '', s, flags=re.M)
    s = re.sub(r"^export \{[^}]*\};\n", '', s, flags=re.M)
    s = re.sub(r"^export (const|function|class|let) ", r"\1 ", s, flags=re.M)
    js += f'\n// ---- {m}.js ----\n' + s

# Service workers do not run inside the preview frame
js = re.sub(r"if \('serviceWorker' in navigator.*?\n\}\n", '', js, flags=re.S)
assert 'serviceWorker' not in js, 'service worker registration not removed'

page = f'''<title>Morning Move</title>
<style>
{read('css/style.css')}
</style>
{body}
<script type="module">
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
{js}
</script>
'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(page)
print(f'wrote {OUT} ({len(page) // 1024} KB)')
