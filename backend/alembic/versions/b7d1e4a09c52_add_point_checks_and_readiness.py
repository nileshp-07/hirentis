"""add point checks, model answer and readiness to evaluations and reports

Revision ID: b7d1e4a09c52
Revises: 99c1b20f70f0
Create Date: 2026-11-22 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7d1e4a09c52"
down_revision: Union[str, None] = "99c1b20f70f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # All nullable: existing rows keep working and the previous app version is unaffected
    op.add_column(
        "response_evaluations", sa.Column("point_checks", sa.JSON(), nullable=True)
    )
    op.add_column(
        "response_evaluations", sa.Column("model_answer", sa.Text(), nullable=True)
    )
    op.add_column(
        "interview_reports", sa.Column("readiness_verdict", sa.Text(), nullable=True)
    )
    op.add_column(
        "interview_reports", sa.Column("top_priorities", sa.JSON(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("interview_reports", "top_priorities")
    op.drop_column("interview_reports", "readiness_verdict")
    op.drop_column("response_evaluations", "model_answer")
    op.drop_column("response_evaluations", "point_checks")
