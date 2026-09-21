#!/usr/bin/env python3
"""
planner.py — Planejador Mensal da Grade Editorial
Popula o Calendário Editorial no Notion com 30 dias de slots,
aplicando as regras de rotação de Praças e formatos.

USO:
    python planner.py              → planejar próximos 30 dias
    python planner.py --dias 14    → planejar próximos 14 dias
    python planner.py --inicio 2026-05-01 --dias 30
"""
import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent))
from notion_calendar import criar_slot, slots_do_dia

# ── REGRAS DE ROTAÇÃO ─────────────────────────────────────────────────────────
PRACAS = ["MENTE", "SISTEMA", "CORPO", "ESPÍRITO", "ALAVANCA"]

# Cada horário tem afinidade com formatos específicos
FORMATO_09 = ["B - Demolição+Reconstrução", "D - História+Verdade"]
FORMATO_13 = ["A - Tese+Tradução", "C - Lista Revelação"]
FORMATO_20 = ["D - História+Verdade", "B - Demolição+Reconstrução"]

HORARIOS = [
    ("09h00", FORMATO_09),
    ("13h00", FORMATO_13),
    ("20h00", FORMATO_20),
]

# Restrição: ESPÍRITO nunca segunda às 09h
RESTRICOES = {("ESPÍRITO", "Segunda", "09h00")}

# ── BANCO DE CARROSSEIS PRONTOS ───────────────────────────────────────────────
DATA_FILE = Path(__file__).parent / "dashboard/data/carousels.json"

def carrosseis_por_praca():
    """Retorna dict: PRAÇA → [carrosseis prontos com slidesDir]"""
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except:
        return {}

    banco = {}
    for c in data:
        if c.get("status") not in ("pronto", "rascunho"):
            continue
        praca = c.get("praca", "").upper()
        if not praca:
            continue
        if praca not in banco:
            banco[praca] = []
        banco[praca].append(c)
    return banco

# ── GERAR ROTAÇÃO ─────────────────────────────────────────────────────────────
def praca_para_slot(dia_idx: int, slot_idx: int, dia_semana: str) -> str:
    """Seleciona a Praça para um slot, evitando repetição no dia."""
    # Cada slot usa um offset diferente no ciclo de 5 Praças
    offsets = [0, 2, 4]  # 09h, 13h, 20h — garantem 3 Praças distintas
    praca = PRACAS[(dia_idx + offsets[slot_idx]) % 5]

    # Restrição: ESPÍRITO não pode ser na segunda às 09h
    if (praca, dia_semana, HORARIOS[slot_idx][0]) in RESTRICOES:
        praca = PRACAS[(dia_idx + offsets[slot_idx] + 1) % 5]
    return praca

DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

# ── EXECUTAR ──────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Planejador Editorial — Oráculo Manager")
    parser.add_argument("--inicio", default=None, help="Data de início YYYY-MM-DD (padrão: amanhã)")
    parser.add_argument("--dias",   type=int, default=30, help="Quantos dias planejar (padrão: 30)")
    parser.add_argument("--dry-run", action="store_true", help="Mostrar plano sem criar no Notion")
    args = parser.parse_args()

    inicio = date.fromisoformat(args.inicio) if args.inicio else date.today() + timedelta(days=1)
    banco  = carrosseis_por_praca()
    usado  = {p: 0 for p in PRACAS}  # controle de qual carrossel usar por praça

    print(f"\n{'='*62}")
    print("  PLANEJADOR EDITORIAL — FONTE OCULTA")
    print(f"  Início: {inicio} | {args.dias} dias | {args.dias * 3} slots")
    print(f"{'='*62}\n")

    criados = 0
    for dia_idx in range(args.dias):
        data_atual = inicio + timedelta(days=dia_idx)
        data_str   = data_atual.isoformat()
        dia_semana = DIAS_SEMANA[data_atual.weekday()]

        # Verificar se já tem slots criados para esse dia
        if not args.dry_run:
            existentes = slots_do_dia(data_str)
            if len(existentes) >= 3:
                print(f"  {data_str} ({dia_semana}) — já planejado, pulando")
                continue

        print(f"  {data_str} ({dia_semana})")

        for slot_idx, (horario, formatos) in enumerate(HORARIOS):
            praca   = praca_para_slot(dia_idx, slot_idx, dia_semana)
            formato = formatos[dia_idx % len(formatos)]

            # Tentar atribuir carrossel existente
            carousel_id = ""
            slides_dir  = ""
            status      = "Planejado"

            disponiveis = banco.get(praca, [])
            if disponiveis:
                idx = usado.get(praca, 0) % len(disponiveis)
                c   = disponiveis[idx]
                carousel_id = c["id"]
                slides_dir  = c.get("slidesDir", "")
                status      = "Pronto"
                usado[praca] = idx + 1

            marker = "✅" if status == "Pronto" else "📋"
            print(f"    {marker} {horario} | {praca:<10} | {formato[:20]:<20} | {carousel_id or '(gerar)'}")

            if not args.dry_run:
                criar_slot(
                    data=data_str,
                    horario=horario,
                    praca=praca,
                    formato=formato,
                    carousel_id=carousel_id,
                    slides_dir=slides_dir,
                    status=status,
                )
                criados += 1

        print()

    if args.dry_run:
        print("  [DRY RUN] Nada criado. Remova --dry-run para criar no Notion.")
    else:
        print(f"  {'='*58}")
        print(f"  {criados} slots criados no Notion.")
        print("  Acesse: https://notion.so")
        print(f"  {'='*58}\n")

if __name__ == "__main__":
    main()
