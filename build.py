"""Baut eine einzelne, eigenständige Datei dist/BrainForge.html (CSS + alle JS inline).
Aufruf:  python build.py
Die Datei kann per WhatsApp/Drive/Mail verschickt werden und läuft per Doppelklick."""
import re, os, pathlib
root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')
def inline_css(m):
    return '<style>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '\n</style>'
def inline_js(m):
    return '<script>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '\n</script>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)
out = root / 'dist'; out.mkdir(exist_ok=True)
(out / 'BrainForge.html').write_text(html, encoding='utf-8')
print('OK ->', out / 'BrainForge.html', round(os.path.getsize(out / 'BrainForge.html') / 1024), 'KB')
