#!/usr/bin/env python3
"""
gestor.py — Gestor de Projetos da Fonte Oculta
Orquestra o calendário editorial, rotação de Praças e status da produção.

USO:
    python gestor.py status          → dashboard completo
    python gestor.py grade           → monta grade semanal
    python gestor.py proximos        → próximas 9 publicações
    python gestor.py backlog         → análise do banco e alertas
    python gestor.py atribuir SEG 09 carrossel-08  → atribui manualmente
"""

import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

DATA_FILE  = Path("C:/Users/julia/nano-banana-mcp/dashboard/data/carousels.json")
HORARIOS   = ["09", "13", "20"]
DIAS_PT    = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"]
PRACAS     = ["MENTE", "SISTEMA", "CORPO", "ESPÍRITO", "ALAVANCA"]

# ── Regras de Rotação ─────────────────────────────────────────────────────────
# Cada horário tem afinidade natural de formato
HORARIO_FORMATO = {
    "09": ["B", "D"],   # Paradoxo/confronto → salvo e compartilhado
    "13": ["A", "C"],   # Profundidade/educação → salvo e colecionado
    "20": ["B", "D"],   # Tribal/identidade → comentado e enviado
}

# SISTEMA e CORPO devem aparecer a cada 2 dias (âncora de autoridade)
PRACAS_OBRIGATORIAS_2DIAS = ["SISTEMA", "CORPO"]

# ESPÍRITO nunca na segunda às 09h (menor engajamento matinal)
RESTRICOES = [("ESPÍRITO", "SEG", "09")]

# ── Cores terminal ────────────────────────────────────────────────────────────
R  = "\033[91m"   # vermelho
G  = "\033[92m"   # verde
Y  = "\033[93m"   # amarelo
B  = "\033[94m"   # azul
M  = "\033[95m"   # magenta
C  = "\033[96m"   # ciano
W  = "\033[97m"   # branco
DIM = "\033[2m"
RST = "\033[0m"
BOLD = "\033[1m"

def read_db():
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        # Remove duplicatas pelo id, mantém o primeiro válido
        seen, clean = set(), []
        for c in data:
            if c["id"] not in seen and c.get("totalSlides", 0) > 0:
                seen.add(c["id"])
                clean.append(c)
        return clean
    except Exception as e:
        print(f"{R}Erro ao ler banco: {e}{RST}")
        return []

def save_db(data):
    DATA_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )

def praca_cor(praca):
    cores = {
        "MENTE":    M,
        "SISTEMA":  R,
        "CORPO":    C,
        "ESPÍRITO": Y,
        "ALAVANCA": G,
    }
    return cores.get(praca, W)

# ── STATUS DASHBOARD ──────────────────────────────────────────────────────────
def cmd_status():
    db = read_db()
    total      = len(db)
    publicados = [c for c in db if c["status"] == "publicado"]
    prontos    = [c for c in db if c["status"] == "pronto" and not c.get("scheduledAt")]
    agendados  = [c for c in db if c.get("scheduledAt")]
    rascunhos  = [c for c in db if c["status"] == "rascunho"]

    # Distribuição de Praças no banco disponível
    praca_count = defaultdict(int)
    for c in prontos + agendados:
        praca_count[c.get("praca", "?")] += 1

    semana_slots = 7 * 3  # 21 slots/semana

    print(f"\n{BOLD}{'━'*58}{RST}")
    print(f"{BOLD}  FONTE OCULTA — GESTOR DE PROJETOS{RST}  {DIM}{datetime.now().strftime('%d/%m/%Y %H:%M')}{RST}")
    print(f"{BOLD}{'━'*58}{RST}")
    print(f"  {W}📦 Banco total:       {BOLD}{total}{RST} carrosséis")
    print(f"  {G}✅ Publicados:        {BOLD}{len(publicados)}{RST}")

    alerta_agendado = R if len(agendados) < 7 else G
    print(f"  {alerta_agendado}📅 Agendados:         {BOLD}{len(agendados)}{RST}  {'← ALERTA: manter mínimo 7' if len(agendados) < 7 else ''}{RST}")
    print(f"  {Y}📝 Prontos sem data:  {BOLD}{len(prontos)}{RST}")

    alerta_rasc = R if rascunhos else DIM
    print(f"  {alerta_rasc}🔴 Rascunhos:         {BOLD}{len(rascunhos)}{RST}  {'← requer revisão' if rascunhos else ''}{RST}")

    print(f"\n  {BOLD}PRAÇAS NO BANCO DISPONÍVEL{RST}")
    max_slots = max(praca_count.values()) if praca_count else 1
    for p in PRACAS:
        n    = praca_count.get(p, 0)
        bar  = "█" * n + "░" * (10 - min(n, 10))
        cor  = praca_cor(p)
        warn = f"  {R}← SUB-REPRESENTADO{RST}" if n <= 1 else ""
        print(f"  {cor}{p:<10}{RST}  {bar}  {n}{warn}")

    # Próximos agendados
    agendados_ord = sorted(agendados, key=lambda c: c.get("scheduledAt",""))
    print(f"\n  {BOLD}PRÓXIMAS PUBLICAÇÕES AGENDADAS{RST}")
    if agendados_ord:
        for c in agendados_ord[:6]:
            praca = c.get("praca", "?")
            cor   = praca_cor(praca)
            score = c.get("revisorScore", "—")
            print(f"  {DIM}{c.get('scheduledAt','?')} {c.get('scheduledHora','??')}h{RST}  {cor}{praca}{RST}  {c['id']}  {DIM}{c['title'][:38]}...  [{score}]{RST}")
    else:
        print(f"  {R}Nenhum carrossel agendado. Execute: python gestor.py grade{RST}")

    # Alertas de produção
    print(f"\n  {BOLD}ALERTAS{RST}")
    alerts = 0
    if len(prontos) + len(agendados) < 14:
        dias = (len(prontos) + len(agendados)) // 3
        print(f"  {Y}⚠️  Estoque para ~{dias} dias. Gerar novos temas urgente.{RST}")
        alerts += 1
    sem_score = [c for c in prontos if not c.get("revisorScore") or c.get("revisorScore") == "—"]
    if sem_score:
        print(f"  {Y}⚠️  {len(sem_score)} carrosséis sem score do Oráculo Revisor:{RST}")
        for c in sem_score:
            print(f"      {DIM}→ {c['id']} — {c['title'][:45]}...{RST}")
        alerts += 1
    if not alerts:
        print(f"  {G}✅ Tudo em ordem.{RST}")

    print(f"{BOLD}{'━'*58}{RST}\n")

# ── GRADE SEMANAL ─────────────────────────────────────────────────────────────
def cmd_grade():
    db       = read_db()
    disponiveis = [c for c in db if c["status"] == "pronto" and not c.get("scheduledAt")]

    if not disponiveis:
        print(f"\n{R}Nenhum carrossel pronto sem agendamento. Banco vazio.{RST}\n")
        return

    # Pega segunda-feira da semana atual
    hoje  = datetime.now().date()
    delta = hoje.weekday()
    seg   = hoje - timedelta(days=delta)

    # Verificar quais Praças foram usadas nos últimos 7 dias
    publicados_recentes = [
        c for c in db
        if c["status"] in ("publicado","agendado")
        and c.get("publishedAt") or c.get("scheduledAt")
    ]
    pracas_usadas_recente = defaultdict(int)
    for c in publicados_recentes:
        data_ref = c.get("scheduledAt") or c.get("publishedAt","")
        if data_ref:
            try:
                d = datetime.strptime(data_ref, "%Y-%m-%d").date()
                if (hoje - d).days <= 7:
                    pracas_usadas_recente[c.get("praca","?")] += 1
            except:
                pass

    grade = {}   # {(dia, hora): carrossel_id}
    usados_ids  = set()
    usados_dia  = defaultdict(set)    # dia → {pracas usadas}
    praca_ciclo = defaultdict(int)    # controla rotação geral

    # Ordena disponíveis priorizando Praças menos usadas recentemente
    def prioridade(c):
        p = c.get("praca","?")
        score = c.get("revisorScore","0/15")
        nota  = int(score.split("/")[0]) if "/" in str(score) else 0
        return (pracas_usadas_recente.get(p,0), -nota)

    pool = sorted(disponiveis, key=prioridade)

    for dia in DIAS_PT:
        for hora in HORARIOS:
            formatos_ok = HORARIO_FORMATO[hora]
            restricao   = (None, dia, hora)

            # Filtra candidatos válidos para este slot
            candidatos = [
                c for c in pool
                if c["id"] not in usados_ids
                and c.get("format") in formatos_ok
                and c.get("praca") not in usados_dia[dia]
                and (c.get("praca"), dia, hora) not in [r for r in RESTRICOES]
            ]

            # Fallback sem restrição de formato se não houver candidatos
            if not candidatos:
                candidatos = [
                    c for c in pool
                    if c["id"] not in usados_ids
                    and c.get("praca") not in usados_dia[dia]
                ]

            # Último fallback — ignora restrição de Praça no dia
            if not candidatos:
                candidatos = [c for c in pool if c["id"] not in usados_ids]

            if not candidatos:
                grade[(dia, hora)] = None
                continue

            escolhido = candidatos[0]
            grade[(dia, hora)] = escolhido
            usados_ids.add(escolhido["id"])
            usados_dia[dia].add(escolhido.get("praca"))

    # Exibe e pergunta confirmação
    print(f"\n{BOLD}{'━'*72}{RST}")
    print(f"{BOLD}  GRADE SEMANAL — Semana de {seg.strftime('%d/%m')} a {(seg+timedelta(6)).strftime('%d/%m/%Y')}{RST}")
    print(f"{BOLD}{'━'*72}{RST}")
    print(f"  {'DIA':<5}  {'09h':<22}  {'13h':<22}  {'20h':<22}")
    print(f"  {'─'*5}  {'─'*22}  {'─'*22}  {'─'*22}")

    for i, dia in enumerate(DIAS_PT):
        data_dia = seg + timedelta(days=i)
        linha = f"  {BOLD}{dia}{RST} {DIM}{data_dia.strftime('%d/%m')}{RST}  "
        for hora in HORARIOS:
            c = grade.get((dia, hora))
            if c:
                praca = c.get("praca","?")
                cor   = praca_cor(praca)
                cel   = f"{cor}{praca}{RST}/{c.get('format','?')} {DIM}{c['id']}{RST}"
            else:
                cel   = f"{DIM}[vazio]{RST}"
            linha += f"{cel:<33}  "
        print(linha)

    print(f"{BOLD}{'━'*72}{RST}")

    # Pergunta confirmação
    print(f"\n  {Y}Confirmar e salvar esta grade no banco? (s/n):{RST} ", end="")
    resp = input().strip().lower()
    if resp == "s":
        _salvar_grade(grade, seg, db)
    else:
        print(f"  {DIM}Grade descartada. Nenhuma alteração salva.{RST}\n")

def _salvar_grade(grade, seg_date, db):
    atualizados = 0
    db_map = {c["id"]: c for c in db}

    for i, dia in enumerate(DIAS_PT):
        data_dia = (seg_date + timedelta(days=i)).strftime("%Y-%m-%d")
        for hora in HORARIOS:
            c = grade.get((dia, hora))
            if not c:
                continue
            if c["id"] in db_map:
                db_map[c["id"]]["scheduledAt"]   = data_dia
                db_map[c["id"]]["scheduledHora"]  = hora
                db_map[c["id"]]["scheduledDia"]   = dia
                db_map[c["id"]]["status"]          = "agendado"
                atualizados += 1

    save_db(list(db_map.values()))
    print(f"\n  {G}✅ {atualizados} carrosséis agendados e salvos no banco.{RST}")
    print(f"  {DIM}Execute 'python gestor.py status' para ver o painel atualizado.{RST}\n")

# ── PRÓXIMAS PUBLICAÇÕES ──────────────────────────────────────────────────────
def cmd_proximos():
    db = read_db()
    agendados = sorted(
        [c for c in db if c.get("scheduledAt")],
        key=lambda c: (c.get("scheduledAt",""), c.get("scheduledHora","00"))
    )

    print(f"\n{BOLD}{'━'*62}{RST}")
    print(f"{BOLD}  PRÓXIMAS PUBLICAÇÕES — Fonte Oculta{RST}")
    print(f"{BOLD}{'━'*62}{RST}")

    if not agendados:
        print(f"  {R}Nenhum carrossel agendado. Execute: python gestor.py grade{RST}")
    else:
        for c in agendados[:12]:
            praca = c.get("praca","?")
            cor   = praca_cor(praca)
            score = c.get("revisorScore","—")
            preset = c.get("preset","—")
            data_h = f"{c.get('scheduledAt','?')} às {c.get('scheduledHora','??')}h"
            print(f"\n  {BOLD}{data_h}{RST}  {cor}[{praca}]{RST}  Formato {c.get('format','?')}")
            print(f"  {DIM}{c['id']}{RST}  Score: {G if '15' in str(score) else Y}{score}{RST}  Preset: {preset}")
            print(f"  {c['title'][:62]}")

    print(f"\n{BOLD}{'━'*62}{RST}\n")

# ── BACKLOG ───────────────────────────────────────────────────────────────────
def cmd_backlog():
    db = read_db()
    prontos   = [c for c in db if c["status"] in ("pronto","agendado")]
    dias_rest = len(prontos) // 3

    print(f"\n{BOLD}{'━'*62}{RST}")
    print(f"{BOLD}  ANÁLISE DE BACKLOG — Fonte Oculta{RST}")
    print(f"{BOLD}{'━'*62}{RST}")
    print(f"\n  Estoque atual: {BOLD}{len(prontos)}{RST} carrosséis = {BOLD}~{dias_rest} dias{RST} de conteúdo")

    if dias_rest < 5:
        print(f"\n  {R}{BOLD}⚠️  CRÍTICO: menos de 5 dias de estoque.{RST}")
        print(f"  {R}Gerar novos carrosséis IMEDIATAMENTE.{RST}")
    elif dias_rest < 10:
        print(f"\n  {Y}{BOLD}⚠️  ATENÇÃO: menos de 10 dias de estoque.{RST}")
        print(f"  {Y}Iniciar produção de novos temas esta semana.{RST}")
    else:
        print(f"\n  {G}✅ Estoque saudável.{RST}")

    # Praças deficitárias
    praca_count = defaultdict(int)
    for c in prontos:
        praca_count[c.get("praca","?")] += 1

    print(f"\n  {BOLD}TEMAS PRIORITÁRIOS A GERAR (Praças deficitárias):{RST}")
    deficit = [(p, praca_count.get(p,0)) for p in PRACAS]
    deficit.sort(key=lambda x: x[1])
    for p, n in deficit:
        cor  = praca_cor(p)
        star = " ← GERAR AGORA" if n <= 1 else ""
        print(f"  {cor}{p:<10}{RST}  {n} carrosséis{R}{star}{RST}")

    # Formatos deficitários
    fmt_count = defaultdict(int)
    for c in prontos:
        fmt_count[c.get("format","?")] += 1
    print(f"\n  {BOLD}FORMATOS:{RST}")
    for f in ["A","B","C","D"]:
        nomes = {"A":"Tese+Tradução","B":"Demolição+Reconstrução","C":"Lista Revelação","D":"História+Verdade"}
        n = fmt_count.get(f,0)
        print(f"  Formato {f} ({nomes[f]}): {BOLD}{n}{RST}")

    print(f"\n{BOLD}{'━'*62}{RST}\n")

# ── ATRIBUIÇÃO MANUAL ─────────────────────────────────────────────────────────
def cmd_atribuir(dia, hora, carousel_id):
    db = read_db()
    hoje  = datetime.now().date()
    delta = hoje.weekday()
    seg   = hoje - timedelta(days=delta)

    if dia.upper() not in DIAS_PT:
        print(f"{R}Dia inválido. Use: {', '.join(DIAS_PT)}{RST}")
        return
    if hora not in HORARIOS:
        print(f"{R}Hora inválida. Use: 09, 13 ou 20{RST}")
        return

    idx_dia    = DIAS_PT.index(dia.upper())
    data_slot  = (seg + timedelta(days=idx_dia)).strftime("%Y-%m-%d")

    atualizado = False
    for c in db:
        if c["id"] == carousel_id:
            c["scheduledAt"]   = data_slot
            c["scheduledHora"] = hora
            c["scheduledDia"]  = dia.upper()
            c["status"]        = "agendado"
            atualizado = True
            print(f"\n  {G}✅ {carousel_id} agendado para {dia} {data_slot} às {hora}h{RST}\n")
            break

    if not atualizado:
        print(f"{R}Carrossel '{carousel_id}' não encontrado no banco.{RST}")
        return

    save_db(db)

# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = sys.argv[1:]

    if not args or args[0] == "status":
        cmd_status()
    elif args[0] == "grade":
        cmd_grade()
    elif args[0] == "proximos":
        cmd_proximos()
    elif args[0] == "backlog":
        cmd_backlog()
    elif args[0] == "atribuir" and len(args) == 4:
        cmd_atribuir(args[1], args[2], args[3])
    else:
        print(f"""
{BOLD}GESTOR DE PROJETOS — Fonte Oculta{RST}

  python gestor.py status                        → dashboard completo
  python gestor.py grade                         → monta grade semanal
  python gestor.py proximos                      → próximas publicações
  python gestor.py backlog                       → análise e alertas
  python gestor.py atribuir SEG 09 carrossel-08 → atribuição manual
""")
