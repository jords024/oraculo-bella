#!/usr/bin/env python3
"""
sanitize_keys.py
Substitui API keys hardcoded por os.getenv() em todos os scripts Python.
Executa uma única vez para preparar o repo para o GitHub.
"""
import re
from pathlib import Path

ROOT = Path("C:/Users/julia/nano-banana-mcp")

# Padrão: API_KEY  = "AIzaSy..." (com variações de espaço)
GEMINI_KEY_PATTERN = re.compile(
    r'^(API_KEY\s*=\s*)"AIzaSy[A-Za-z0-9_\-]+"',
    re.MULTILINE
)
GEMINI_KEY_REPLACEMENT = r'\1os.getenv("GEMINI_API_KEY")'

# Verificar se o arquivo já tem import os
HAS_IMPORT_OS = re.compile(r'^\s*import os\b', re.MULTILINE)
HAS_DOTENV    = re.compile(r'load_dotenv', re.MULTILINE)

# Bloco de carregamento de env a inserir (após os imports do stdlib)
ENV_BLOCK = '''\nimport os\nfrom dotenv import load_dotenv\nload_dotenv()\n'''

# Arquivos a ignorar
SKIP = {
    "sanitize_keys.py",
    "node_modules",
    "__pycache__",
}

changed = []
skipped = []

py_files = [f for f in ROOT.rglob("*.py")
            if not any(s in str(f) for s in SKIP)]

for fp in sorted(py_files):
    content = fp.read_text(encoding="utf-8", errors="ignore")

    # Verificar se tem API_KEY hardcoded do Gemini
    if not GEMINI_KEY_PATTERN.search(content):
        skipped.append(fp.name)
        continue

    new_content = content

    # 1. Substituir a key
    new_content = GEMINI_KEY_PATTERN.sub(GEMINI_KEY_REPLACEMENT, new_content)

    # 2. Adicionar import os + load_dotenv se não existir
    if not HAS_IMPORT_OS.search(new_content) or not HAS_DOTENV.search(new_content):
        # Inserir após o bloco de comentários/docstring iniciais e imports existentes
        # Encontrar a linha do primeiro import real
        lines = new_content.splitlines(keepends=True)
        insert_at = 0
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith("#") or stripped.startswith('"""') or stripped.startswith("'''") or stripped == "":
                insert_at = i + 1
            elif stripped.startswith("import ") or stripped.startswith("from "):
                # Inserir antes do primeiro import (mas após comentários/shebang)
                break

        if not HAS_DOTENV.search(new_content):
            lines.insert(insert_at, ENV_BLOCK)
            new_content = "".join(lines)

    fp.write_text(new_content, encoding="utf-8")
    changed.append(fp.name)
    print(f"  ✓ {fp.name}")

print(f"\nSanitizados: {len(changed)} arquivos")
print(f"Sem key hardcoded: {len(skipped)} arquivos")
if changed:
    print("\nArquivos alterados:")
    for f in changed:
        print(f"  - {f}")
