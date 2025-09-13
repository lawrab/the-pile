"""add_screenshots_to_steam_games

Revision ID: 6d463d925b3d
Revises: bcc986af9821
Create Date: 2025-09-13 16:26:17.552389

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6d463d925b3d'
down_revision = 'bcc986af9821'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add screenshots column to steam_games table
    op.add_column('steam_games', sa.Column('screenshots', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove screenshots column from steam_games table
    op.drop_column('steam_games', 'screenshots')