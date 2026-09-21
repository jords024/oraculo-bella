"""Initial Schema and Indexes Baseline

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-21 15:38:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Tabela carousels
    op.execute("""
        CREATE TABLE IF NOT EXISTS carousels (
            id VARCHAR(100) PRIMARY KEY,
            title TEXT NOT NULL,
            theme VARCHAR(255),
            praca VARCHAR(100),
            format VARCHAR(50),
            preset VARCHAR(100),
            status VARCHAR(100),
            created_at VARCHAR(50),
            slides_dir TEXT,
            slide_prefix VARCHAR(100),
            total_slides INTEGER,
            image_quality VARCHAR(100) DEFAULT 'high',
            b2_base_url TEXT,
            image_provider VARCHAR(100) DEFAULT 'gpt-image-2',
            copy_model VARCHAR(100) DEFAULT 'gpt-4o',
            no_image_slides_count INTEGER DEFAULT 0,
            caption TEXT,
            notes TEXT,
            slides JSONB,
            chat_history JSONB,
            last_payload JSONB,
            is_pinned BOOLEAN DEFAULT FALSE,
            pinned_at TIMESTAMP DEFAULT NULL,
            generation_duration VARCHAR(100),
            generation_time_seconds INTEGER,
            scheduled_at TIMESTAMP DEFAULT NULL,
            scheduled_timestamp BIGINT DEFAULT NULL
        );
    """)

    # 2. Tabela reels_history
    op.execute("""
        CREATE TABLE IF NOT EXISTS reels_history (
            id SERIAL PRIMARY KEY,
            gancho_original TEXT,
            padrao_psicologico TEXT,
            roteiro_fonte_oculta TEXT,
            transcricao_original TEXT,
            url TEXT,
            timestamp VARCHAR(100)
        );
    """)

    # 3. Tabela dashboard_users
    op.execute("""
        CREATE TABLE IF NOT EXISTS dashboard_users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            permissions JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 4. Tabela invitations
    op.execute("""
        CREATE TABLE IF NOT EXISTS invitations (
            id VARCHAR(100) PRIMARY KEY,
            role VARCHAR(50) NOT NULL,
            permissions JSONB DEFAULT '{}'::jsonb,
            expires_at TIMESTAMP NOT NULL,
            status VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 5. Tabela backup_config
    op.execute("""
        CREATE TABLE IF NOT EXISTS backup_config (
            id INTEGER PRIMARY KEY DEFAULT 1,
            enabled BOOLEAN DEFAULT FALSE,
            frequency VARCHAR(50) DEFAULT 'hours',
            interval_val INTEGER DEFAULT 6,
            s3_folder VARCHAR(255) DEFAULT 'backups/',
            retention INTEGER DEFAULT 30,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT one_row CHECK (id = 1)
        );
    """)

    # 6. Tabela backup_logs
    op.execute("""
        CREATE TABLE IF NOT EXISTS backup_logs (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) UNIQUE NOT NULL,
            size_bytes BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) NOT NULL,
            error_message TEXT
        );
    """)

    # 7. Tabela agent_prompts
    op.execute("""
        CREATE TABLE IF NOT EXISTS agent_prompts (
            id           VARCHAR(100) PRIMARY KEY,
            display_name VARCHAR(255),
            category     VARCHAR(100),
            content      TEXT NOT NULL DEFAULT '',
            updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 8. Tabela branding
    op.execute("""
        CREATE TABLE IF NOT EXISTS branding (
            id         INTEGER PRIMARY KEY DEFAULT 1,
            data       JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT branding_one_row CHECK (id = 1)
        );
    """)

    # 9. Tabela api_keys
    op.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            key        VARCHAR(100) PRIMARY KEY,
            value      TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 10. Tabela library_images
    op.execute("""
        CREATE TABLE IF NOT EXISTS library_images (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT 'Geral',
            notes TEXT,
            filename VARCHAR(255) NOT NULL,
            storage_path TEXT NOT NULL,
            mime_type VARCHAR(100) DEFAULT 'image/jpeg',
            size_bytes BIGINT DEFAULT 0,
            width INTEGER DEFAULT 0,
            height INTEGER DEFAULT 0,
            prompt TEXT,
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 11. Tabela library_chats
    op.execute("""
        CREATE TABLE IF NOT EXISTS library_chats (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) UNIQUE NOT NULL,
            messages JSONB DEFAULT '[]'::jsonb,
            generated_images JSONB DEFAULT '[]'::jsonb,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # ── Índices de Performance ───────────────────────────────────────────────
    op.execute("CREATE INDEX IF NOT EXISTS idx_carousels_pinned_created ON carousels (is_pinned DESC, pinned_at DESC, created_at DESC);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_carousels_status ON carousels (status);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_carousels_scheduled ON carousels (scheduled_timestamp) WHERE scheduled_timestamp IS NOT NULL;")
    op.execute("CREATE INDEX IF NOT EXISTS idx_library_images_category_created ON library_images (category, created_at DESC);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_backup_logs_created ON backup_logs (created_at DESC);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_invitations_status_expires ON invitations (status, expires_at);")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_invitations_status_expires;")
    op.execute("DROP INDEX IF EXISTS idx_backup_logs_created;")
    op.execute("DROP INDEX IF EXISTS idx_library_images_category_created;")
    op.execute("DROP INDEX IF EXISTS idx_carousels_scheduled;")
    op.execute("DROP INDEX IF EXISTS idx_carousels_status;")
    op.execute("DROP INDEX IF EXISTS idx_carousels_pinned_created;")

    op.execute("DROP TABLE IF EXISTS library_chats CASCADE;")
    op.execute("DROP TABLE IF EXISTS library_images CASCADE;")
    op.execute("DROP TABLE IF EXISTS api_keys CASCADE;")
    op.execute("DROP TABLE IF EXISTS branding CASCADE;")
    op.execute("DROP TABLE IF EXISTS agent_prompts CASCADE;")
    op.execute("DROP TABLE IF EXISTS backup_logs CASCADE;")
    op.execute("DROP TABLE IF EXISTS backup_config CASCADE;")
    op.execute("DROP TABLE IF EXISTS invitations CASCADE;")
    op.execute("DROP TABLE IF EXISTS dashboard_users CASCADE;")
    op.execute("DROP TABLE IF EXISTS reels_history CASCADE;")
    op.execute("DROP TABLE IF EXISTS carousels CASCADE;")
