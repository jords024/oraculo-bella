#!/usr/bin/env python3
"""
add_generation_duration_columns.py
Migração: adiciona colunas de duração de geração na tabela carousels.

USO:
    python backend/scripts/add_generation_duration_columns.py
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(ROOT, ".env"))
except ImportError:
    pass

import psycopg2


def run():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "123456"),
        database=os.getenv("DB_NAME", "oracle_manager"),
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("[Migração] Adicionando colunas de duração na tabela carousels...")

    cur.execute("""
        ALTER TABLE carousels
        ADD COLUMN IF NOT EXISTS generation_duration VARCHAR(100);
    """)
    print("  ✅ Coluna generation_duration adicionada (ou já existia).")

    cur.execute("""
        ALTER TABLE carousels
        ADD COLUMN IF NOT EXISTS generation_time_seconds INTEGER;
    """)
    print("  ✅ Coluna generation_time_seconds adicionada (ou já existia).")

    cur.close()
    conn.close()
    print("[Migração] Concluída com sucesso!")

if __name__ == "__main__":
    run()
