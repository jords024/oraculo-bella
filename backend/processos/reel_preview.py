#!/usr/bin/env python3
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
"""
reel_preview.py — Preview em Tempo Real dos Reels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard que lista todos os reels em campanhas/reels/
e exibe os assets de cada cena (voz, sfx, video) em tempo real.

Estrutura esperada:
  campanhas/reels/
    nome-do-reel/
      cena_01/
        voz.mp3
        sfx.mp3
        video.mp4
      cena_02/ ...
      trilha_fundo.mp3

USO:
    python processos/reel_preview.py  → http://localhost:4242
"""

import json
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

REELS_DIR = Path("campanhas/reels")
PORT = 4242

# ── HTML shell ────────────────────────────────────────────────────────────────

HTML_SHELL = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fonte Oculta — Reel Preview</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #050508;
    color: #e8e0d0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    min-height: 100vh;
    padding: 24px;
  }
  header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; padding-bottom: 16px;
    border-bottom: 1px solid #1a1a2e;
  }
  h1 { font-size: 18px; font-weight: 600; color: #FFB300; letter-spacing: 0.08em; }
  .live { display:flex; align-items:center; gap:8px; font-size:11px; color:#666; text-transform:uppercase; letter-spacing:.1em; }
  .pulse { width:8px; height:8px; border-radius:50%; background:#39FF14; animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* Reel tabs */
  .reel-tabs {
    display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .reel-tab {
    padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 600;
    letter-spacing: .06em; cursor: pointer; border: 1px solid #1a1a35;
    background: #0c0c18; color: #666; text-transform: uppercase;
    transition: all .2s;
  }
  .reel-tab.active { background: #FFB300; color: #000; border-color: #FFB300; }
  .reel-tab:hover:not(.active) { border-color: #FFB30055; color: #aaa; }

  /* Reel panels */
  .reel-panel { display: none; }
  .reel-panel.active { display: block; }

  .reel-meta {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; padding: 12px 16px;
    background: #0c0c18; border: 1px solid #1a1a35; border-radius: 10px;
    font-size: 12px; color: #666;
  }
  .reel-meta strong { color: #FFB300; }

  /* Scene grid */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .cena {
    background: #0c0c18; border: 1px solid #1a1a35;
    border-radius: 12px; overflow: hidden;
    transition: border-color .3s;
  }
  .cena:hover { border-color: #FFB30033; }
  .cena-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; background: #0f0f20;
    border-bottom: 1px solid #1a1a35;
  }
  .cena-num { font-size: 11px; color: #FFB300; font-weight: 700; letter-spacing: .1em; }
  .badges { display:flex; gap:5px; }
  .badge {
    font-size: 10px; padding: 2px 7px; border-radius: 20px; font-weight: 600;
  }
  .badge.voz   { background:#1a2a4a; color:#4488FF; }
  .badge.sfx   { background:#2a1a3a; color:#9B4DCA; }
  .badge.video { background:#2a1a10; color:#FFB300; }
  .badge.miss  { background:#111; color:#333; }

  .cena-body { padding: 12px 14px; display:flex; flex-direction:column; gap:10px; }
  .asset-label { font-size:10px; color:#555; text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }

  audio { width:100%; height:30px; filter:invert(1) hue-rotate(180deg); opacity:.8; }
  video { width:100%; border-radius:8px; background:#000; max-height:200px; object-fit:cover; }
  .ph {
    height:28px; background:#111; border-radius:6px;
    display:flex; align-items:center; padding:0 10px;
    font-size:11px; color:#2a2a2a; font-style:italic;
  }
  .vph {
    height:110px; background:#080810; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; color:#2a2a2a; font-style:italic;
    border:1px dashed #1a1a35;
  }

  /* Trilha */
  .trilha {
    background:#0c0c18; border:1px solid #1a1a35; border-radius:10px; overflow:hidden;
  }
  .trilha-header { padding:12px 14px; background:#0f0f20; border-bottom:1px solid #1a1a35; font-size:11px; color:#FFB300; font-weight:700; letter-spacing:.1em; }
  .trilha-body { padding:12px 14px; }

  .empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:40vh; color:#2a2a2a; gap:10px; text-align:center;
  }
  .empty .icon { font-size:48px; opacity:.4; }
  footer { margin-top:40px; text-align:center; font-size:11px; color:#1a1a1a; }
</style>
<script>
  let lastSig = "";
  let pendingUpdate = false;

  function isPlaying() {
    return [...document.querySelectorAll('audio, video')].some(m => !m.paused);
  }

  function showUpdateBanner() {
    if (document.getElementById('update-banner')) return;
    const b = document.createElement('div');
    b.id = 'update-banner';
    b.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#FFB300;color:#000;padding:10px 18px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;z-index:999;letter-spacing:.05em;box-shadow:0 4px 20px #FFB30055';
    b.textContent = 'Novo asset gerado — clique para atualizar';
    b.onclick = () => location.reload();
    document.body.appendChild(b);
  }

  async function poll() {
    try {
      const r = await fetch('/api/state');
      const data = await r.json();
      if (data.sig !== lastSig) {
        if (lastSig === "") { lastSig = data.sig; return; }
        lastSig = data.sig;
        if (isPlaying()) {
          showUpdateBanner();
        } else {
          location.reload();
        }
      }
    } catch(e) {}
  }
  setInterval(poll, 5000);

  function showReel(id) {
    document.querySelectorAll('.reel-tab').forEach(t => t.classList.toggle('active', t.dataset.reel === id));
    document.querySelectorAll('.reel-panel').forEach(p => p.classList.toggle('active', p.id === 'reel-' + id));
    localStorage.setItem('activeReel', id);
  }
  window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('activeReel');
    const first = document.querySelector('.reel-tab');
    if (first) showReel(saved || first.dataset.reel);
  });
</script>
</head>
<body>
<header>
  <h1>FONTE OCULTA — REEL PREVIEW</h1>
  <div class="live"><div class="pulse"></div><span>Ao vivo · 3s</span></div>
</header>
{{BODY}}
<footer>FONTE OCULTA © 2026</footer>
</body>
</html>"""


# ── Scanner ────────────────────────────────────────────────────────────────────

def scan_reels():
    """Retorna dict: {reel_slug: {num: {voz, sfx, video}, 'trilha': path}}"""
    if not REELS_DIR.exists():
        return {}

    reels = {}
    for reel_path in sorted(REELS_DIR.iterdir()):
        if not reel_path.is_dir():
            continue
        slug = reel_path.name
        data = {"cenas": {}, "trilha": None}

        trilha = reel_path / "trilha_fundo.mp3"
        if trilha.exists():
            data["trilha"] = trilha

        for sub in sorted(reel_path.iterdir()):
            if not sub.is_dir() or not sub.name.startswith("cena_"):
                continue
            try:
                num = int(sub.name.split("_")[1])
            except (IndexError, ValueError):
                continue
            data["cenas"][num] = {
                "voz":   sub / "voz.mp3"   if (sub / "voz.mp3").exists()   else None,
                "sfx":   sub / "sfx.mp3"   if (sub / "sfx.mp3").exists()   else None,
                "video": sub / "video.mp4"  if (sub / "video.mp4").exists() else None,
            }

        if data["cenas"] or data["trilha"]:
            reels[slug] = data

    return reels


def state_sig(reels):
    total = sum(
        sum(1 for v in c.values() if v) for r in reels.values() for c in r["cenas"].values()
    ) + sum(1 for r in reels.values() if r["trilha"])
    return f"{list(reels.keys())}:{total}"


# ── HTML builder ───────────────────────────────────────────────────────────────

def build_html(reels):
    if not reels:
        body = """<div class="empty"><div class="icon">&#127761;</div>
        <p>Nenhum reel encontrado ainda.</p>
        <small>python processos/reel_observador.py</small></div>"""
        return HTML_SHELL.replace("{{BODY}}", body)

    tabs = []
    panels = []

    for slug, data in reels.items():
        label = slug.replace("-", " ").upper()
        cenas = data["cenas"]
        trilha = data["trilha"]

        total_cenas = max(cenas.keys()) if cenas else 7
        total_cenas = max(total_cenas, 7)

        tabs.append(f'<div class="reel-tab" data-reel="{slug}" onclick="showReel(\'{slug}\')">{label}</div>')

        # meta bar
        done = sum(1 for c in cenas.values() if c.get("video"))
        meta = f'<div class="reel-meta"><strong>{done}/{total_cenas}</strong> cenas com vídeo &nbsp;·&nbsp; '
        meta += f'<strong>{"✅" if trilha else "⏳"}</strong> trilha</div>'

        # scene grid
        grid_parts = ['<div class="grid">']
        for i in range(1, total_cenas + 1):
            c = cenas.get(i, {})
            voz   = c.get("voz")
            sfx   = c.get("sfx")
            video = c.get("video")

            b_voz   = '<span class="badge voz">VOZ</span>'   if voz   else '<span class="badge miss">VOZ</span>'
            b_sfx   = '<span class="badge sfx">SFX</span>'   if sfx   else '<span class="badge miss">SFX</span>'
            b_video = '<span class="badge video">VIDEO</span>' if video else '<span class="badge miss">VIDEO</span>'

            def ap(f, tag, url_prefix):
                if f:
                    rel = f.relative_to(REELS_DIR).as_posix()
                    if tag == "audio":
                        return f'<audio controls src="/media/{rel}"></audio>'
                    else:
                        return f'<video controls src="/media/{rel}" playsinline></video>'
                else:
                    if tag == "audio":
                        return '<div class="ph">gerando...</div>'
                    else:
                        return '<div class="vph">renderizando...</div>'

            grid_parts.append(f"""
        <div class="cena">
          <div class="cena-header">
            <span class="cena-num">CENA {i:02d}</span>
            <div class="badges">{b_voz}{b_sfx}{b_video}</div>
          </div>
          <div class="cena-body">
            <div><div class="asset-label">Narração</div>{ap(voz, "audio", slug)}</div>
            <div><div class="asset-label">SFX Ambiental</div>{ap(sfx, "audio", slug)}</div>
            <div><div class="asset-label">Vídeo</div>{ap(video, "video", slug)}</div>
          </div>
        </div>""")
        grid_parts.append("</div>")

        # trilha
        if trilha:
            rel = trilha.relative_to(REELS_DIR).as_posix()
            trilha_html = f'<audio controls src="/media/{rel}" style="width:100%"></audio>'
        else:
            trilha_html = '<div class="ph">aguardando trilha...</div>'

        panel_html = f"""
    <div class="reel-panel" id="reel-{slug}">
      {meta}
      {"".join(grid_parts)}
      <div class="trilha">
        <div class="trilha-header">TRILHA DE FUNDO</div>
        <div class="trilha-body">{trilha_html}</div>
      </div>
    </div>"""
        panels.append(panel_html)

    body = f'<div class="reel-tabs">{"".join(tabs)}</div>' + "".join(panels)
    return HTML_SHELL.replace("{{BODY}}", body)


# ── HTTP Handler ───────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            reels = scan_reels()
            html = build_html(reels).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)

        elif self.path == "/api/state":
            reels = scan_reels()
            payload = json.dumps({"sig": state_sig(reels)}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(payload)

        elif self.path.startswith("/media/"):
            rel = self.path[7:]  # remove /media/
            fpath = REELS_DIR / rel
            if fpath.exists() and fpath.is_file():
                ext = fpath.suffix.lower()
                mime = {".mp3": "audio/mpeg", ".mp4": "video/mp4", ".wav": "audio/wav"}.get(ext, "application/octet-stream")
                data = fpath.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    REELS_DIR.mkdir(parents=True, exist_ok=True)
    server = HTTPServer(("localhost", PORT), Handler)

    print("\n" + "="*50)
    print("  REEL PREVIEW -- Fonte Oculta")
    print("="*50)
    print(f"  Acessivel em: http://localhost:{PORT}")
    print(f"  Pasta monitorada: {REELS_DIR.resolve()}")
    print("  Auto-atualiza a cada 3 segundos")
    print("\n  Ctrl+C para encerrar")
    print("="*50 + "\n")

    def open_browser():
        import time; time.sleep(1)
        webbrowser.open(f"http://localhost:{PORT}")

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Preview encerrado.")


if __name__ == "__main__":
    main()
