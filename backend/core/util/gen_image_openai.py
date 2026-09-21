#!/usr/bin/env python3
"""
gen_image_openai.py — Gerador de imagens via OpenAI (gpt-image-1 / dall-e-3)
Drop-in replacement para o gen() do Gemini nos scripts de carrossel.

USO NOS SCRIPTS DE CARROSSEL:
    # Substituir:
    from core.util.gen_image_openai import gen_openai as gen

MODELOS:
    "gpt-image-1"  → GPT Image 2 (mais recente, melhor qualidade)
    "dall-e-3"     → DALL-E 3 (mais rápido, amplamente disponível)
"""

import base64
import os
import sys
import time
from pathlib import Path

# Carrega .env localmente; no Render as variáveis já estão no ambiente
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env")
except ImportError:
    pass

try:
    from openai import OpenAI
except ImportError:
    print("❌ openai não instalado. Execute: pip install openai")
    sys.exit(1)

# ── Configuração ───────────────────────────────────────────────────────────────
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MODEL      = "gpt-image-2"

# Tamanhos disponíveis
# gpt-image-1:  "1024x1024", "1024x1536" (portrait), "1536x1024" (landscape), "auto"
# dall-e-3:     "1024x1024", "1792x1024", "1024x1792"
SIZE = "1024x1536"   # retrato — mais próximo do 1080×1350 do Instagram

# Qualidade (gpt-image-1: "low" | "medium" | "high" | "auto")
QUALITY = "high"

MAX_RETRIES = 3

# ── Cliente ────────────────────────────────────────────────────────────────────
def _get_client() -> OpenAI:
    if not OPENAI_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY não encontrada no .env\n"
            "Adicione: OPENAI_API_KEY=sk-proj-..."
        )
    return OpenAI(api_key=OPENAI_KEY)


# ── Função principal ───────────────────────────────────────────────────────────
def gen_openai(prompt: str, retries: int = MAX_RETRIES, size: str = None, quality: str = None, reference_paths=None) -> bytes | None:
    """
    Gera uma imagem via OpenAI e retorna os bytes PNG/JPEG.
    Respeita dinamicamente a variável de ambiente ACTIVE_IMAGE_PROVIDER.
    """
    client = _get_client()

    active_provider = (os.getenv("ACTIVE_IMAGE_PROVIDER") or "gpt-image-1").lower().strip()
    if active_provider in ["gpt-image-1-mini", "dall-e-2", "mini", "economico"]:
        model_name = "gpt-image-1-mini"
        target_size = size or "1024x1536"
    elif active_provider in ["gpt-image-1"]:
        model_name = "gpt-image-1"
        target_size = size or "1024x1536"
    elif active_provider in ["gpt-image-2"]:
        model_name = "gpt-image-2"
        target_size = size or "1024x1536"
    elif active_provider in ["dall-e-3"]:
        model_name = "dall-e-3"
        target_size = size or "1024x1792"
    else:
        model_name = active_provider
        target_size = size or "1024x1536"

    for attempt in range(1, retries + 1):
        try:
            print(f"    [OpenAI {model_name} ({active_provider})] tentativa {attempt}/{retries} ({target_size})...")

            kwargs = {
                "model":  model_name,
                "prompt": prompt,
                "n":      1,
                "size":   target_size,
            }

            if model_name == "dall-e-3":
                kwargs["quality"] = quality or "hd"
                response = client.images.generate(**kwargs)
            elif reference_paths:
                valid_paths = [Path(item) for item in reference_paths if item and Path(item).exists()]
                handles = [item.open("rb") for item in valid_paths]
                try:
                    edit_prompt = (
                        "Use the attached image only as a design-language reference: hierarchy, visual rhythm, tonal depth, "
                        "tactile material, negative space and emotional intensity. Create the entirely new scene requested below. "
                        "Do not copy its subject, text, logo, watermark, layout or composition. Do not generate text inside the image.\n\n"
                        + prompt
                    )
                    try:
                        response = client.images.edit(model=model_name, image=handles, prompt=edit_prompt, n=1,
                                                      size=target_size, quality=quality or "high")
                    except Exception as reference_error:
                        print(f"    [AVISO] Referencia visual indisponivel; gerando sem anexo: {str(reference_error)[:90]}")
                        kwargs["quality"] = quality or "high"
                        response = client.images.generate(**kwargs)
                finally:
                    for handle in handles: handle.close()
            else:
                kwargs["quality"] = quality or "high"
                response = client.images.generate(**kwargs)
            item     = response.data[0]

            if hasattr(item, "b64_json") and item.b64_json:
                return base64.b64decode(item.b64_json)

            # Se veio URL (padrão universal da OpenAI)
            if hasattr(item, "url") and item.url:
                import urllib.request
                req = urllib.request.Request(item.url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=60) as r:
                    return r.read()

            print(f"    ⚠️  Resposta inesperada: {item}")

        except Exception as e:
            err = str(e)
            print(f"    ❌ Tentativa {attempt} falhou: {err[:120]}")

            # Content policy block — não faz sentido repetir
            if "content_policy" in err.lower() or "safety" in err.lower():
                print("    ⛔ Bloqueio de conteúdo — pulando este slide")
                return None

            if attempt < retries:
                wait = 4 * attempt
                print(f"    ⏳ Aguardando {wait}s antes de tentar novamente...")
                time.sleep(wait)

    return None


# ── Verificação rápida ─────────────────────────────────────────────────────────
def verificar_key() -> bool:
    """Testa se a OPENAI_API_KEY é válida (chamada leve ao endpoint de modelos)."""
    try:
        client = _get_client()
        models = client.models.list()
        return any("image" in m.id or "dall" in m.id for m in models.data)
    except Exception as e:
        print(f"  [Erro] API Key invalida ou sem permissao: {e}")
        return False


# ── CLI de teste ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Teste do gerador OpenAI")
    parser.add_argument("--check",  action="store_true", help="Verifica a API key")
    parser.add_argument("--modelo", default=MODEL, choices=["gpt-image-1", "dall-e-3"],
                        help="Modelo a usar")
    parser.add_argument("--prompt", default="", help="Prompt de teste")
    parser.add_argument("--out",    default="test_output.png", help="Arquivo de saída")
    args = parser.parse_args()

    MODEL = args.modelo  # override global

    print(f"\n{'='*55}")
    print(f"  OpenAI Image Generator — {MODEL}")
    print(f"{'='*55}\n")

    if args.check:
        ok = verificar_key()
        print(f"  API Key: {'[OK] Valida' if ok else '[ERRO] Invalida'}")
        sys.exit(0 if ok else 1)

    prompt = args.prompt or (
        "Painterly digital oil painting, mystical cinematic atmosphere. "
        "A single ancient golden key floating in deep cosmic space, "
        "surrounded by soft luminous particles of amber and teal light. "
        "Rich painterly texture, dramatic lighting, atmospheric depth. "
        "No text, no letters."
    )

    print(f"  Modelo:  {MODEL}")
    print(f"  Tamanho: {SIZE}")
    print(f"  Quality: {QUALITY}")
    print(f"  Prompt:  {prompt[:80]}...\n")

    img_bytes = gen_openai(prompt)

    if img_bytes:
        out = Path(args.out)
        out.write_bytes(img_bytes)
        print(f"\n  ✅ Imagem gerada! Salva em: {out.resolve()}")
        print(f"  Tamanho: {len(img_bytes) / 1024:.0f} KB\n")
    else:
        print("\n  ❌ Falha na geração.\n")
        sys.exit(1)
