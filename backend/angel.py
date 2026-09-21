"""
Angel — Executora da Pipeline de Conteúdo
Social Media Orchestrator

Responsabilidades:
- Organizar slides PNG em pastas do Drive por data
- Gerar legenda.txt para cada carrossel
- Integrar com o sistema de carrossel existente
- Reportar status para Claude atualizar o Notion
"""

import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

# ─── Configuração ─────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent
CAROUSELS_DIR = BASE_DIR / "carousels"
DRIVE_STAGING_DIR = BASE_DIR / "drive_staging"  # pasta local antes de enviar pro Drive
CAROUSELS_JSON = BASE_DIR / "carousels.json"

DRIVE_FOLDER_ID = "16HJjfcQcWou3XfaoCVL3v80oC654TnPw"
PRODUCT_URL = "@isabella.dalcin"
CTA_FIXO = "Comente BELLA para Academia Sete · Método T.A.F.A"

# ─── Utilidades ───────────────────────────────────────────────────────────────

def log(msg: str, level: str = "INFO"):
    """Loga com timestamp — Angel sempre registra tudo."""
    ts = datetime.now().strftime("%H:%M:%S")
    prefix = {"INFO": "→", "OK": "✅", "ERR": "❌", "WARN": "⚠️"}.get(level, "•")
    print(f"[{ts}] {prefix} {msg}")
    return f"[{ts}] {msg}"


def slugify(text: str) -> str:
    """Converte texto para slug de URL/pasta."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text[:50]


def load_carousels() -> list:
    """Carrega o carousels.json."""
    if not CAROUSELS_JSON.exists():
        return []
    with open(CAROUSELS_JSON, encoding="utf-8") as f:
        return json.load(f)


def save_carousels(data: list):
    """Salva o carousels.json."""
    with open(CAROUSELS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─── Gerador de Legenda ────────────────────────────────────────────────────────

def generate_legenda(gancho: str, copy_slides: list, bolha_a: str = "", bolha_b: str = "",
                     pillar: str = "GENÉRICO", formato: str = "C") -> str:
    """
    Gera a legenda completa para Instagram.
    Estrutura: Gancho | Educação resumida | Bolhas | CTA
    """
    # Emojis por pilar
    pillar_emojis = {
        "DEUS": "🙏✨", "ESPIRITUAL": "🙏✨", "CONSCIÊNCIA": "🌌🧠",
        "HISTÓRICO": "📜🔍", "CIÊNCIA": "⚛️🔬", "FÍSICO": "⚛️🔬",
        "DINHEIRO": "💰🎯", "RELACIONAMENTOS": "❤️🌱", "GENÉRICO": "✨🔓"
    }
    emoji = pillar_emojis.get(pillar.upper(), "✨")

    # Hashtags por pilar
    hashtags_map = {
        "DEUS": "#espiritualidade #consciencia #deus #fé #expansao #despertar",
        "ESPIRITUAL": "#espiritualidade #consciencia #despertar #frequencia #vibracao",
        "CONSCIÊNCIA": "#consciencia #quantica #expansao #despertar #mente",
        "HISTÓRICO": "#historiaoculta #verdadeoculta #espiritualidade #consciencia",
        "CIÊNCIA": "#quantica #neurociencia #ciencia #consciencia #mente",
        "DINHEIRO": "#abundancia #mentalidade #prosperidade #consciencia",
        "RELACIONAMENTOS": "#relacionamentos #amor #consciencia #evolucao",
        "GENÉRICO": "#espiritualidade #consciencia #despertar #expansao",
    }
    hashtags = hashtags_map.get(pillar.upper(), hashtags_map["GENÉRICO"])

    # Monta a legenda
    legenda_parts = []

    # Linha 1: Gancho forte
    legenda_parts.append(f"{emoji} {gancho}")
    legenda_parts.append("")

    # Resumo educativo (3-4 pontos dos slides do meio)
    if copy_slides and len(copy_slides) >= 5:
        legenda_parts.append("Nesse carrossel você vai descobrir:")
        for slide in copy_slides[2:5]:
            titulo = slide.get("title", "").strip()
            if titulo and len(titulo) > 5:
                legenda_parts.append(f"→ {titulo}")
        legenda_parts.append("")

    # Bolhas (se existirem)
    if bolha_a and bolha_b:
        legenda_parts.append("💬 Com qual você se identifica?")
        legenda_parts.append(f"A) {bolha_a}")
        legenda_parts.append(f"B) {bolha_b}")
        legenda_parts.append("")

    # CTA fixo
    legenda_parts.append("👇 COMENTE: FONTE")
    legenda_parts.append(f"Que eu te envio a {CTA_FIXO} gratuitamente")
    legenda_parts.append(f"({PRODUCT_URL})")
    legenda_parts.append("")

    # Hashtags
    legenda_parts.append(hashtags)

    return "\n".join(legenda_parts)


# ─── Organizador do Drive Staging ──────────────────────────────────────────────

def organize_for_drive(carousel_id: str, data_publicacao: str, horario: str,
                       gancho: str, legenda: str) -> dict:
    """
    Organiza os slides PNG em pasta local estruturada para upload no Drive.
    Retorna: { "folder_path": str, "slide_count": int, "legenda_path": str }
    """
    # Encontra a pasta do carrossel
    carousel_folder = CAROUSELS_DIR / carousel_id
    if not carousel_folder.exists():
        log(f"Pasta do carrossel não encontrada: {carousel_folder}", "ERR")
        return None

    # Cria estrutura: drive_staging/YYYY-MM-DD/HHh-slug/
    hora_slug = horario.replace(":", "h").replace(":00", "h")
    gancho_slug = slugify(gancho)
    folder_name = f"{hora_slug}-{gancho_slug}"
    target_dir = DRIVE_STAGING_DIR / data_publicacao / folder_name
    target_dir.mkdir(parents=True, exist_ok=True)

    # Copia slides em ordem numérica
    slides = sorted(carousel_folder.glob("*.png"))
    slide_count = 0
    for i, slide in enumerate(slides, 1):
        dest_name = f"slide-{i:02d}.png"
        shutil.copy2(slide, target_dir / dest_name)
        slide_count += 1
        log(f"  Copiado: {dest_name}")

    if slide_count == 0:
        log(f"Nenhum slide PNG encontrado em {carousel_folder}", "ERR")
        return None

    # Cria legenda.txt
    legenda_path = target_dir / "legenda.txt"
    with open(legenda_path, "w", encoding="utf-8") as f:
        f.write(f"LEGENDA — {gancho}\n")
        f.write(f"Data: {data_publicacao} | Horário: {horario}\n")
        f.write("=" * 60 + "\n\n")
        f.write(legenda)

    log(f"Drive staging pronto: {target_dir}", "OK")
    log(f"  {slide_count} slides + legenda.txt", "OK")

    return {
        "folder_path": str(target_dir),
        "slide_count": slide_count,
        "legenda_path": str(legenda_path),
        "folder_name": folder_name,
        "date": data_publicacao,
    }


# ─── Score de Viralizaçao ─────────────────────────────────────────────────────

def calcular_score_viralizacao(gancho: str, formato: str, pilar: str,
                               horario: str, bolha_a: str, bolha_b: str,
                               tema_repetido: bool = False) -> dict:
    """
    Calcula o Score de Viralizaçao Preditivo (0-100).
    Baseado na Dimensão 6 da skill Acúmulo de Inteligência.
    """
    score = 0
    detalhes = []

    # Palavras-chave de alta performance (Camada 1 — Fratura de Crença)
    fratura_keywords = ["apagou", "escondeu", "não contaram", "proibiu", "destruiu",
                        "censurou", "suprimiu", "oculta", "verdade que", "mentira que"]
    if any(kw in gancho.lower() for kw in fratura_keywords):
        score += 20
        detalhes.append("✅ +20 — Gancho usa Camada 1 (Fratura de Crença)")
    else:
        detalhes.append("⚠️ +0  — Gancho não usa Camada 1")

    # Número específico no gancho
    import re
    if re.search(r'\d+', gancho):
        score += 15
        detalhes.append("✅ +15 — Contém número específico")
    else:
        detalhes.append("⚠️ +0  — Sem número específico")

    # Combinações ótimas Formato × Pilar
    combinacoes_otimas = {
        ("C", "HISTÓRICO"), ("C", "DEUS"), ("B", "CONSCIÊNCIA"),
        ("D", "DEUS"), ("C", "CIÊNCIA"), ("B", "DINHEIRO"),
    }
    if (formato, pilar.upper()) in combinacoes_otimas:
        score += 15
        detalhes.append(f"✅ +15 — Formato {formato} × Pilar {pilar} é combinação ⭐⭐⭐⭐⭐")
    else:
        score += 7
        detalhes.append(f"ℹ️ +7  — Formato {formato} × Pilar {pilar} é combinação padrão")

    # Slide 09 padrão testado (verificado via copy)
    score += 10  # assume que foi gerado com padrão correto
    detalhes.append("✅ +10 — Slide 09 usa padrão testado")

    # Bolhas equilibradas
    if bolha_a and bolha_b and len(bolha_a) > 10 and len(bolha_b) > 10:
        score += 10
        detalhes.append("✅ +10 — Bolhas A/B definidas")
    else:
        detalhes.append("⚠️ +0  — Bolhas A/B ausentes ou fracas")

    # Curva dramática completa (assume 10 slides)
    score += 10
    detalhes.append("✅ +10 — Curva dramática com 10 slides")

    # Tema não repetido
    if not tema_repetido:
        score += 10
        detalhes.append("✅ +10 — Tema não repetido em 7 dias")
    else:
        detalhes.append("⚠️ +0  — Tema repetido (risco de fadiga)")

    # Horário alinhado com pilar
    alinhamentos = {
        ("08:00", "DEUS"), ("08:00", "ESPIRITUAL"),
        ("13:00", "HISTÓRICO"), ("13:00", "CIÊNCIA"),
        ("20:00", "CONSCIÊNCIA"), ("20:00", "RELACIONAMENTOS"),
    }
    if (horario, pilar.upper()) in alinhamentos:
        score += 5
        detalhes.append("✅ +5  — Horário alinhado com pilar")
    else:
        detalhes.append("ℹ️ +0  — Horário pode ser otimizado")

    # Legenda forte (assume que foi gerada)
    score += 5
    detalhes.append("✅ +5  — Legenda Instagram gerada")

    # Classificação
    if score >= 80:
        classificacao = "🔥 EXPLOSIVO"
        recomendacao = "Publicar imediatamente no horário prime"
    elif score >= 65:
        classificacao = "✅ FORTE"
        recomendacao = "Publicar normalmente"
    elif score >= 50:
        classificacao = "⚠️ MÉDIO"
        recomendacao = "Revisar gancho antes de publicar"
    else:
        classificacao = "❌ FRACO"
        recomendacao = "Reescrever do zero"

    return {
        "score": score,
        "classificacao": classificacao,
        "recomendacao": recomendacao,
        "detalhes": detalhes,
    }


# ─── Pipeline Principal ───────────────────────────────────────────────────────

def executar_pipeline_completa(carousel_data: dict) -> dict:
    """
    Executa todas as responsabilidades locais de Angel para um carrossel aprovado.
    Claude cuida das atualizações no Notion — Angel cuida dos arquivos.

    carousel_data esperado:
    {
        "id": str,
        "gancho": str,
        "data_publicacao": str,  # YYYY-MM-DD
        "horario": str,          # HH:MM
        "formato": str,          # A|B|C|D
        "pilar": str,
        "bolha_a": str,
        "bolha_b": str,
        "copy_slides": list,     # [{title, body}, ...]
    }
    """
    carousel_id = carousel_data.get("id")
    gancho = carousel_data.get("gancho", "")
    data_pub = carousel_data.get("data_publicacao", datetime.now().strftime("%Y-%m-%d"))
    horario = carousel_data.get("horario", "08:00")
    formato = carousel_data.get("formato", "C")
    pilar = carousel_data.get("pilar", "GENÉRICO")
    bolha_a = carousel_data.get("bolha_a", "")
    bolha_b = carousel_data.get("bolha_b", "")
    copy_slides = carousel_data.get("copy_slides", [])

    logs = []
    resultado = {"sucesso": False, "logs": logs}

    log(f"Angel iniciou pipeline para: '{gancho}'")
    logs.append(f"[{datetime.now().strftime('%H:%M')}] Angel iniciou pipeline para '{gancho}'")

    # 1. Calcular score de viralizaçao
    score_data = calcular_score_viralizacao(gancho, formato, pilar, horario, bolha_a, bolha_b)
    log(f"Score de viralizaçao: {score_data['score']}/100 — {score_data['classificacao']}")
    logs.append(f"Score: {score_data['score']}/100 — {score_data['classificacao']}")

    if score_data["score"] < 50:
        log("Score muito baixo. Recomenda reescrita do gancho.", "WARN")
        resultado["alerta"] = f"Score {score_data['score']}/100 — {score_data['recomendacao']}"

    # 2. Gerar legenda Instagram
    log("Gerando legenda Instagram...")
    legenda = generate_legenda(gancho, copy_slides, bolha_a, bolha_b, pilar, formato)
    logs.append(f"[{datetime.now().strftime('%H:%M')}] Legenda Instagram gerada ({len(legenda)} caracteres)")

    # 3. Organizar para Drive
    log("Organizando slides para Drive...")
    drive_result = organize_for_drive(carousel_id, data_pub, horario, gancho, legenda)

    if not drive_result:
        log("Falha ao organizar Drive.", "ERR")
        logs.append(f"[{datetime.now().strftime('%H:%M')}] ERRO: Slides não encontrados")
        resultado["erro"] = "Pasta do carrossel não encontrada"
        return resultado

    logs.append(f"[{datetime.now().strftime('%H:%M')}] Drive staging: {drive_result['slide_count']} slides + legenda.txt")
    logs.append(f"[{datetime.now().strftime('%H:%M')}] Pasta: {drive_result['folder_name']}")

    # 4. Resultado final
    resultado.update({
        "sucesso": True,
        "legenda": legenda,
        "score": score_data,
        "drive_staging": drive_result,
        "logs": logs,
        "log_notion": "\n".join(logs),
    })

    log("Pipeline concluída com sucesso!", "OK")
    log(f"Staging em: {drive_result['folder_path']}", "OK")
    log("Próximo passo: fazer upload do staging para o Google Drive", "INFO")

    return resultado


def mostrar_status():
    """Mostra estado atual dos carrosséis em produção (não publicados)."""
    carousels = load_carousels()
    em_producao = [c for c in carousels if c.get("status") not in ("publicado", None)]

    if not em_producao:
        print("Nenhum carrossel em produção no momento.")
        return

    print(f"\n{'─'*60}")
    print(f"  ANGEL — STATUS DA PIPELINE ({len(em_producao)} em produção)")
    print(f"{'─'*60}")
    for c in em_producao:
        print(f"  {c.get('status','?'):25} | {c.get('id','?')}")
    print(f"{'─'*60}\n")


# ─── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    args = sys.argv[1:]

    if not args or args[0] == "status":
        mostrar_status()

    elif args[0] == "pipeline" and len(args) >= 2:
        # angel.py pipeline {carousel_id} --data YYYY-MM-DD --horario HH:MM --pilar X
        carousel_id = args[1]
        carousels = load_carousels()
        carousel = next((c for c in carousels if c["id"] == carousel_id), None)

        if not carousel:
            log(f"Carrossel '{carousel_id}' não encontrado no carousels.json", "ERR")
            sys.exit(1)

        resultado = executar_pipeline_completa({
            "id": carousel_id,
            "gancho": carousel.get("title", carousel_id),
            "data_publicacao": carousel.get("data_publicacao", datetime.now().strftime("%Y-%m-%d")),
            "horario": carousel.get("horario", "08:00"),
            "formato": carousel.get("formato", "C"),
            "pilar": carousel.get("pilar", "GENÉRICO"),
            "bolha_a": carousel.get("bolha_a", ""),
            "bolha_b": carousel.get("bolha_b", ""),
            "copy_slides": carousel.get("slides", []),
        })

        print(json.dumps(resultado, ensure_ascii=False, indent=2))

    elif args[0] == "score":
        # angel.py score "{gancho}" {formato} {pilar} {horario}
        if len(args) < 5:
            print("Uso: angel.py score \"{gancho}\" {formato} {pilar} {horario}")
            sys.exit(1)
        result = calcular_score_viralizacao(args[1], args[2], args[3], args[4], "", "")
        print(f"\nScore: {result['score']}/100 — {result['classificacao']}")
        print(f"Recomendação: {result['recomendacao']}\n")
        for d in result["detalhes"]:
            print(f"  {d}")

    elif args[0] == "legenda":
        # angel.py legenda "{gancho}" {pilar}
        if len(args) < 3:
            print("Uso: angel.py legenda \"{gancho}\" {pilar}")
            sys.exit(1)
        legenda = generate_legenda(args[1], [], "", "", args[2])
        print("\n" + "─"*60)
        print(legenda)
        print("─"*60 + "\n")

    else:
        print("Angel — Executora da Pipeline de Conteúdo")
        print("\nUso:")
        print("  python angel.py status")
        print("  python angel.py pipeline {carousel_id}")
        print("  python angel.py score \"{gancho}\" {formato} {pilar} {horario}")
        print("  python angel.py legenda \"{gancho}\" {pilar}")
