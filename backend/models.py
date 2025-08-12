from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum,
    DECIMAL,
    TIMESTAMP,
)
from sqlalchemy.sql import func
from database import Base


class AnalysisRequest(Base):
    __tablename__ = "analysis_requests"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    label = Column(Enum("SPAM", "HAM", name="label_enum"), nullable=False)
    spam_probability = Column(
        DECIMAL(3, 2), nullable=False
    )  # Stores value between 0 and 1
    created_at = Column(TIMESTAMP, server_default=func.now())
