import os
import pytest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend', 'src')
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')

IGNORE_DIRS = {
    'node_modules', 'dist', 'build', '.git', '_backups',
    'venv', '.venv', '__pycache__', 'alembic', '.pytest_cache'
}

def test_frontend_files_line_limit():
    """Valida se todos os arquivos do Frontend (JS, JSX, TS, TSX e CSS) respeitam o limite de 500 linhas."""
    violations = []
    
    for root, dirs, files in os.walk(FRONTEND_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f.endswith(('.js', '.jsx', '.ts', '.tsx', '.css')) and not f.endswith('.bak') and not f.endswith('.bak.css') and not f.endswith('.bak.jsx'):
                file_path = os.path.join(root, f)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                    lines = sum(1 for _ in fp)
                if lines > 500:
                    rel_path = os.path.relpath(file_path, ROOT_DIR)
                    violations.append((rel_path, lines))
    
    assert not violations, f"Arquivos do frontend ultrapassando 500 linhas: {violations}"

def test_backend_files_line_limit():
    """Valida se todos os arquivos do Backend (Python) respeitam o limite de 1.000 linhas."""
    violations = []
    
    for root, dirs, files in os.walk(BACKEND_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f.endswith('.py') and not f.endswith('.bak') and not f.endswith('.bak.py'):
                file_path = os.path.join(root, f)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                    lines = sum(1 for _ in fp)
                if lines > 1000:
                    rel_path = os.path.relpath(file_path, ROOT_DIR)
                    violations.append((rel_path, lines))
    
    assert not violations, f"Arquivos do backend ultrapassando 1.000 linhas: {violations}"
