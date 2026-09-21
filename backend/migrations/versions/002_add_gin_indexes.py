"""Add GIN Indexes for JSONB Columns

Revision ID: 002_add_gin_indexes
Revises: 001_initial_schema
Create Date: 2026-08-21 15:43:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_add_gin_indexes'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criação de índices GIN para busca instantânea em estruturas JSONB
    op.execute("CREATE INDEX IF NOT EXISTS idx_carousels_slides_gin ON carousels USING GIN (slides);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_carousels_chat_history_gin ON carousels USING GIN (chat_history);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_library_chats_messages_gin ON library_chats USING GIN (messages);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_dashboard_users_permissions_gin ON dashboard_users USING GIN (permissions);")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_dashboard_users_permissions_gin;")
    op.execute("DROP INDEX IF EXISTS idx_library_chats_messages_gin;")
    op.execute("DROP INDEX IF EXISTS idx_carousels_chat_history_gin;")
    op.execute("DROP INDEX IF EXISTS idx_carousels_slides_gin;")
