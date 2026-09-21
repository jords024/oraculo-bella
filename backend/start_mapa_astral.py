"""Launcher do servidor Mapa da Alma — chamado pelo preview."""
import os
import subprocess
import sys

os.chdir(r"C:\Users\julia\Documents\mapa-astral")

# Limpa PYTHONPATH para evitar conflito com pacotes do nano-banana-mcp
env = os.environ.copy()
env.pop("PYTHONPATH", None)
env["PYTHONPATH"] = ""              # garante ambiente limpo para o uvicorn
env["PYTHONIOENCODING"] = "utf-8"  # evita UnicodeEncodeError no stdout do Windows

sys.exit(subprocess.call([
    r"C:\Users\julia\pinokio\bin\miniconda\envs\mapa-astral\python.exe",
    "-m", "uvicorn", "api.main:app",
    "--host", "0.0.0.0", "--port", "8003", "--reload",
], env=env))
