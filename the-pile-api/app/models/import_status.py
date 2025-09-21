from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class ImportStatus(Base):
    __tablename__ = "import_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    operation_type = Column(String, nullable=False)  # 'import' or 'sync'
    status = Column(String, nullable=False)  # 'running', 'completed', 'failed'
    progress_current = Column(Integer, default=0)
    progress_total = Column(Integer, default=0)
    error_message = Column(String)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
