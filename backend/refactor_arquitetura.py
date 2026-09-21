import glob
import os
import shutil
from pathlib import Path

ROOT_DIR = Path("C:/Users/julia/nano-banana-mcp")

# Define as novas pastas
DIRS = [
    ROOT_DIR / "campanhas" / "carrosseis",
    ROOT_DIR / "campanhas" / "lancamentos",
    ROOT_DIR / "core" / "agentes",
    ROOT_DIR / "core" / "util",
    ROOT_DIR / "infra" / "uploaders",
    ROOT_DIR / "infra" / "social",
    ROOT_DIR / "docs"
]

for d in DIRS:
    d.mkdir(parents=True, exist_ok=True)

# Mapeamento de arquivos para mover
FILE_MOVES = {
    # Agentes
    "diretor_artistico.py": "core/agentes/",
    "oraculo_completo.py": "core/agentes/",
    "planner.py": "core/agentes/",
    "reels_engineer.py": "core/agentes/",
    "register_carousel.py": "core/agentes/",

    # Utils
    "compose_util.py": "core/util/",
    "compose_util_v3.py": "core/util/",
    "compose-slide.py": "core/util/",
    "prompt_builder.py": "core/util/",
    "sanitize_keys.py": "core/util/",
    "retry-missing.py": "core/util/",
    "gen_image_openai.py": "core/util/",

    # Uploaders
    "minio_uploader.py": "infra/uploaders/",
    "catbox_uploader.py": "infra/uploaders/",
    "imgur_uploader.py": "infra/uploaders/",

    # Social
    "instagram_publisher.py": "infra/social/",
    "publish_instagram.py": "infra/social/",
    "top_reels.py": "infra/social/",
    "radar_apify.py": "infra/social/",
    "instagram_login.py": "infra/social/",
    "notion_calendar.py": "infra/social/",
    "popular_notion_30dias.py": "infra/social/"
}

# Mover arquivos e manter controle para reescrever os imports
for filename, new_folder in FILE_MOVES.items():
    src = ROOT_DIR / filename
    dst = ROOT_DIR / new_folder / filename
    if src.exists():
        print(f"Movendo {filename} -> {new_folder}")
        shutil.move(str(src), str(dst))

# Mover campanhas (carrossel-*.py e lancamento_*.py)
for filepath in glob.glob(str(ROOT_DIR / "carrossel-*.py")):
    fname = os.path.basename(filepath)
    shutil.move(filepath, str(ROOT_DIR / "campanhas" / "carrosseis" / fname))
    print(f"Movendo campanha: {fname}")

for filepath in glob.glob(str(ROOT_DIR / "lancamento_*.py")):
    fname = os.path.basename(filepath)
    shutil.move(filepath, str(ROOT_DIR / "campanhas" / "lancamentos" / fname))
    print(f"Movendo lançamento: {fname}")

# Agora, precisamos atualizar os imports nos arquivos Python (campanhas e os próprios core files)
REPLACEMENTS = {
    "from core.util.compose_util import": "from core.util.compose_util import",
    "from core.util.compose_util_v3 import": "from core.util.compose_util_v3 import",
    "from core.util.prompt_builder import": "from core.util.prompt_builder import",
    "from core.agentes.register_carousel import": "from core.agentes.register_carousel import",
    "import core.util.compose_util as compose_util": "import core.util.compose_util as compose_util",
    "from core.util.gen_image_openai import": "from core.util.gen_image_openai import",
}

def process_file(filepath):
    try:
        with open(filepath, encoding='utf-8') as f:
            content = f.read()

        modified = False
        for old_str, new_str in REPLACEMENTS.items():
            if old_str in content:
                content = content.replace(old_str, new_str)
                modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Imports atualizados em: {os.path.basename(filepath)}")
    except Exception as e:
        print(f"Erro ao processar {filepath}: {e}")

# Processar todos os arquivos em core, infra e campanhas
for root, dirs, files in os.walk(ROOT_DIR):
    if "node_modules" in root or ".git" in root or "dashboard" in root:
        continue
    for file in files:
        if file.endswith('.py'):
            process_file(os.path.join(root, file))

print("Organização concluída!")
