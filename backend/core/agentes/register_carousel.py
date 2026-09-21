#!/usr/bin/env python3
"""
register_carousel.py — Registra automaticamente um carrossel no dashboard.
Chamado no final de todo script de geração de carrossel (apenas no Windows local).

Uso:
    from core.agentes.register_carousel import register

    register(
        title       = "Titulo do carrossel",
        theme       = "slug-do-tema",
        format      = "B",
        slides_dir  = "C:/Users/julia/Desktop/carrossel-xxx",
        caption     = "Texto da caption...",
        revisor_score = "15/15",
        notes       = "Observacoes adicionais",
    )

IMPORTANTE: até 2026-08-31 este módulo gravava num arquivo JSON legado em
`C:/Users/julia/nano-banana-mcp/dashboard/data/carousels.json` — um caminho de
projeto antigo que o dashboard atual (Postgres/PGlite, backend/dashboard) nunca lê.
Isso fazia carrosséis gerados localmente "sumirem" da tela do dashboard mesmo
tendo sido processados com sucesso. Agora ele registra direto na mesma API que
o dashboard usa, autenticando com um JWT assinado com o JWT_SECRET do .env
(o mesmo processo que já roda o dashboard passa essa variável para este script
como variável de ambiente, então não é preciso reler o .env aqui).
"""
import base64
import hashlib
import hmac
import json
import os
import time
import urllib.error
import urllib.request


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _make_jwt(payload: dict, secret: str, expires_in: int = 300) -> str:
    """Assina um JWT HS256 sem depender de biblioteca externa (PyJWT não
    está instalado no ambiente Windows local)."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    full_payload = {**payload, "iat": now, "exp": now + expires_in}
    segments = [
        _b64url(json.dumps(header, separators=(",", ":")).encode("utf-8")),
        _b64url(json.dumps(full_payload, separators=(",", ":")).encode("utf-8")),
    ]
    signing_input = ".".join(segments).encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    segments.append(_b64url(signature))
    return ".".join(segments)


def _dashboard_base_url() -> str:
    port = os.environ.get("PORT", "3131")
    return f"http://localhost:{port}"


def _auth_token() -> str | None:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        return None
    user = os.environ.get("DASHBOARD_USER", "admin@exemplo.com.br")
    user_name = os.environ.get("DASHBOARD_USER_NAME", "Super Admin")
    payload = {"user": user, "userName": user_name, "email": user, "role": "admin"}
    return _make_jwt(payload, secret)


def _api_request(method: str, path: str, token: str, body: dict | None = None, timeout: float = 5.0):
    url = f"{_dashboard_base_url()}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def broadcast_event(event_type: str, data: dict):
    """Notifica o dashboard aberto (SSE) de progresso — falha silenciosa se
    o dashboard não estiver rodando, pois isso é apenas cosmético."""
    token = _auth_token()
    if not token:
        return
    try:
        _api_request("POST", "/api/events/broadcast", token, {"type": event_type, "data": data}, timeout=1.5)
    except Exception:
        pass


def _count_slides(slides_dir: str, prefix: str = "slide-") -> int:
    from pathlib import Path
    d = Path(slides_dir)
    if not d.exists():
        return 0
    return len([f for f in d.iterdir()
                if f.name.startswith(prefix) and f.suffix.lower() in (".jpg", ".jpeg", ".png")])


def register(
    title: str,
    theme: str,
    slides_dir: str,
    format: str = "TAFA",
    caption: str = "",
    revisor_score: str = "",
    notes: str = "",
    status: str = "pronto",
    slide_prefix: str = "slide-",
) -> dict:
    """
    Registra (cria ou atualiza) o carrossel diretamente no banco de dados do
    dashboard atual, via a mesma API HTTP que o frontend usa.

    Faz upsert por `slidesDir`: se já existir um carrossel apontando para essa
    pasta, atualiza o registro existente em vez de criar um duplicado — mesmo
    comportamento do registrador antigo, só que apontando para o lugar certo.
    """
    total = _count_slides(slides_dir, slide_prefix)
    token = _auth_token()

    if not token:
        print("\n[Dashboard] JWT_SECRET não encontrado no ambiente — pulei o registro no dashboard "
              f"({title}, {total} slides salvos normalmente em {slides_dir}).")
        return {"id": None, "title": title, "totalSlides": total, "slidesDir": slides_dir, "registered": False}

    if revisor_score:
        notes = f"{notes}\nRevisor: {revisor_score}".strip()

    try:
        existing_list = _api_request("GET", "/api/carousels", token)
    except Exception as e:
        print(f"\n[Dashboard] Não consegui falar com o dashboard em {_dashboard_base_url()} "
              f"({e}). Os arquivos foram salvos normalmente em {slides_dir}, "
              "mas não aparecerão na lista até o dashboard estar rodando e você registrar manualmente.")
        return {"id": None, "title": title, "totalSlides": total, "slidesDir": slides_dir, "registered": False}

    normalized_dir = os.path.normcase(os.path.normpath(slides_dir))
    existing = next(
        (c for c in existing_list
         if c.get("slidesDir") and os.path.normcase(os.path.normpath(c["slidesDir"])) == normalized_dir),
        None,
    )

    body = {
        "title": title,
        "theme": theme,
        "format": format,
        "status": status,
        "slidesDir": slides_dir,
        "totalSlides": total,
        "caption": caption,
        "notes": notes,
    }

    try:
        if existing:
            entry = _api_request("PUT", f"/api/carousels/{existing['id']}", token, body)
            print(f"\n[Dashboard] Atualizado: {entry['id']} — {total} slides registrados.")
        else:
            entry = _api_request("POST", "/api/carousels", token, body)
            print(f"\n[Dashboard] Registrado: {entry['id']} — {total} slides — {slides_dir}")
        entry["registered"] = True
        return entry
    except Exception as e:
        print(f"\n[Dashboard] Falha ao registrar carrossel via API ({e}). "
              f"Os arquivos foram salvos normalmente em {slides_dir}.")
        return {"id": None, "title": title, "totalSlides": total, "slidesDir": slides_dir, "registered": False}
