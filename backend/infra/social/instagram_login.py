#!/usr/bin/env python3
"""
instagram_login.py — Faz login no Instagram e salva a sessao.
Execute este script UMA VEZ no terminal. Depois a publicacao e automatica.

COMO USAR:
    python -X utf8 instagram_login.py
"""
import time
from pathlib import Path
from uuid import uuid4

from instagrapi import Client
from instagrapi.exceptions import TwoFactorRequired

SESSION_FILE = Path("C:/Users/julia/nano-banana-mcp/.instagram_session.json")

def load_env():
    env = {}
    env_file = Path("C:/Users/julia/nano-banana-mcp/.env")
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

ENV      = load_env()
USERNAME = ENV.get("INSTAGRAM_USERNAME", "afonteoculta")
PASSWORD = ENV.get("INSTAGRAM_PASSWORD", "")

print("\n" + "="*55)
print("  LOGIN INSTAGRAM — Fonte Oculta")
print("="*55)
print(f"  Conta: @{USERNAME}\n")

cl = Client()
cl.delay_range = [2, 5]

try:
    cl.login(USERNAME, PASSWORD)
    print("  Login realizado sem 2FA!")

except TwoFactorRequired:
    print("  Verificacao em duas etapas detectada.\n")

    # Captura os dados do 2FA da resposta do Instagram
    two_factor_info = cl.last_json.get("two_factor_info", {})
    identifier      = two_factor_info.get("two_factor_identifier", "")
    totp_on         = two_factor_info.get("totp_two_factor_on", False)
    sms_on          = two_factor_info.get("sms_two_factor_on", False)
    whatsapp_on     = two_factor_info.get("whatsapp_two_factor_on", False)

    if totp_on:
        method = "1"
        print("  Metodo detectado: App autenticador (TOTP)")
    elif sms_on:
        method = "0"
        print("  Metodo detectado: SMS")
    elif whatsapp_on:
        method = "4"
        print("  Metodo detectado: WhatsApp")
    else:
        method = "1"
        print("  Metodo nao identificado — usando TOTP (1)")

    print("  Verifique seu celular ou app autenticador.\n")
    code = input("  Digite o codigo de 6 digitos: ").strip()

    # Chama o endpoint de 2FA diretamente com o metodo correto
    # (evita o verification_method: "3" hardcoded dentro do cl.login())
    try:
        data = {
            "verification_code": code,
            "phone_id":          cl.phone_id,
            "_csrftoken":        cl.token,
            "two_factor_identifier": identifier,
            "username":          USERNAME,
            "trust_this_device": "0",
            "guid":              cl.uuid,
            "device_id":         cl.android_device_id,
            "waterfall_id":      str(uuid4()),
            "verification_method": method,
        }
        cl.private_request("accounts/two_factor_login/", data, login=True)
        cl.authorization_data = cl.parse_authorization(
            cl.last_response.headers.get("ig-set-authorization")
        )
        cl.login_flow()
        cl.last_login = time.time()
        print("\n  Login com 2FA realizado!")

    except Exception as e2:
        print(f"\n  Erro no 2FA: {e2}")
        exit(1)

except Exception as e:
    print(f"\n  Erro no login: {e}")
    exit(1)

# Salva a sessao
cl.dump_settings(SESSION_FILE)
print(f"  Sessao salva em: {SESSION_FILE}")
print("\n" + "="*55)
print("  PRONTO! Agora execute:")
print("  python -X utf8 publish_instagram.py --id carrossel-04")
print("="*55 + "\n")
