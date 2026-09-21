#!/usr/bin/env python3
"""
setup_scheduler.py — Configura o Task Scheduler do Windows
Cria 3 tarefas agendadas que executam publisher.py nos horários corretos.

USO:
    python setup_scheduler.py         → criar as 3 tarefas
    python setup_scheduler.py --list  → listar tarefas criadas
    python setup_scheduler.py --remove → remover as tarefas
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PYTHON   = sys.executable
ROOT     = Path(__file__).parent
PUB      = str(ROOT / "publisher.py")

TAREFAS = [
    {
        "nome":    "FonteOculta-09h",
        "horario": "09:00",
        "label":   "09h00 — Paradoxo / Confronto",
    },
    {
        "nome":    "FonteOculta-13h",
        "horario": "13:00",
        "label":   "13h00 — Educação / Profundidade",
    },
    {
        "nome":    "FonteOculta-20h",
        "horario": "20:00",
        "label":   "20h00 — Tribal / Identidade",
    },
]

def criar_tarefa(nome, horario):
    """Cria uma tarefa no Windows Task Scheduler."""
    cmd = [
        "schtasks", "/Create",
        "/TN",  f"\\FonteOculta\\{nome}",
        "/TR",  f'"{PYTHON}" "{PUB}"',
        "/SC",  "DAILY",
        "/ST",  horario,
        "/F",                   # sobrescrever se existir
        "/RL", "HIGHEST",       # executar com privilégios altos
        "/RU", os.getlogin(),  # usuário atual
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0, result.stdout + result.stderr

def remover_tarefa(nome):
    cmd = ["schtasks", "/Delete", "/TN", f"\\FonteOculta\\{nome}", "/F"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def listar_tarefas():
    cmd = ["schtasks", "/Query", "/TN", "\\FonteOculta", "/FO", "LIST"]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="cp1252", errors="replace")
    return result.stdout or "Nenhuma tarefa FonteOculta encontrada."

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--list",   action="store_true", help="Listar tarefas")
    parser.add_argument("--remove", action="store_true", help="Remover tarefas")
    args = parser.parse_args()

    print(f"\n{'='*56}")
    print("  SCHEDULER — Fonte Oculta")
    print(f"  Python: {PYTHON}")
    print(f"  Script: {PUB}")
    print(f"{'='*56}\n")

    if args.list:
        print(listar_tarefas())
        return

    if args.remove:
        for t in TAREFAS:
            ok = remover_tarefa(t["nome"])
            print(f"  {'✅' if ok else '❌'} Removida: {t['nome']}")
        return

    # Criar as 3 tarefas
    print("  Criando tarefas no Windows Task Scheduler...\n")
    for t in TAREFAS:
        ok, msg = criar_tarefa(t["nome"], t["horario"])
        status  = "✅ Criada" if ok else "❌ Erro"
        print(f"  {status}: {t['nome']} — {t['label']}")
        if not ok and msg:
            print(f"    {msg.strip()[:120]}")

    print(f"\n  {'='*52}")
    print("  Tarefas ativas. Próximas execuções:")
    for t in TAREFAS:
        print(f"    🕐 {t['horario']} → {t['label']}")
    print("\n  Para verificar: python setup_scheduler.py --list")
    print("  Para remover:  python setup_scheduler.py --remove")
    print(f"  {'='*52}\n")

if __name__ == "__main__":
    main()
