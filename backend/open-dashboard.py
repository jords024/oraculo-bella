#!/usr/bin/env python3
"""
open-dashboard.py — Inicia o dashboard e abre no browser.

USO:
    python -X utf8 open-dashboard.py

O script:
1. Verifica se o servidor já está rodando na porta 3131
2. Se não estiver, inicia o servidor Node.js em background
3. Abre http://localhost:3131 no browser padrão
"""
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

DASHBOARD_DIR = Path("C:/Users/julia/nano-banana-mcp/dashboard")
PORT = 3131
URL  = f"http://localhost:{PORT}"


def is_running() -> bool:
    try:
        with urllib.request.urlopen(URL + "/api/carousels", timeout=3) as r:
            return r.status == 200
    except Exception:
        return False


def start_server():
    print(f"  Iniciando dashboard na porta {PORT}...")
    subprocess.Popen(
        ["node", "server.js"],
        cwd=str(DASHBOARD_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )
    # Aguarda o servidor subir
    for i in range(10):
        time.sleep(1)
        if is_running():
            print(f"  Servidor ativo em {URL}")
            return True
        print(f"  Aguardando... ({i+1}/10)")
    return False


print("\n" + "="*55)
print("  Nano Banana — Dashboard")
print("="*55)

if is_running():
    print(f"  Dashboard ja esta rodando em {URL}")
else:
    ok = start_server()
    if not ok:
        print("  ERRO: nao foi possivel iniciar o servidor.")
        print("  Execute manualmente:")
        print(f"  cd {DASHBOARD_DIR}")
        print("  node server.js")
        sys.exit(1)

print(f"  Abrindo {URL} no browser...")
webbrowser.open(URL)
print("="*55 + "\n")
