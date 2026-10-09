"""add blockchain anchoring columns to documents and appointments

Revision ID: 7a89b1c2d3e4
Revises: 9945550e3dfa
Create Date: 2026-10-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a89b1c2d3e4'
down_revision: Union[str, None] = '9945550e3dfa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Documents table updates
    op.add_column('documents', sa.Column('sha256_hash', sa.String(length=64), nullable=True))
    op.add_column('documents', sa.Column('blockchain_tx_hash', sa.String(length=66), nullable=True))
    op.add_column('documents', sa.Column('blockchain_status', sa.String(length=20), server_default='unanchored', nullable=False))
    op.create_index(op.f('ix_documents_sha256_hash'), 'documents', ['sha256_hash'], unique=False)

    # Appointments table updates
    op.add_column('appointments', sa.Column('sha256_hash', sa.String(length=64), nullable=True))
    op.add_column('appointments', sa.Column('blockchain_tx_hash', sa.String(length=66), nullable=True))
    op.add_column('appointments', sa.Column('blockchain_status', sa.String(length=20), server_default='unanchored', nullable=False))
    op.create_index(op.f('ix_appointments_sha256_hash'), 'appointments', ['sha256_hash'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_appointments_sha256_hash'), table_name='appointments')
    op.drop_column('appointments', 'blockchain_status')
    op.drop_column('appointments', 'blockchain_tx_hash')
    op.drop_column('appointments', 'sha256_hash')

    op.drop_index(op.f('ix_documents_sha256_hash'), table_name='documents')
    op.drop_column('documents', 'blockchain_status')
    op.drop_column('documents', 'blockchain_tx_hash')
    op.drop_column('documents', 'sha256_hash')
