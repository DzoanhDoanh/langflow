from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Column, DateTime, Field, Relationship, SQLModel, String, Text, Float, ForeignKey, Index

if TYPE_CHECKING:
    from langflow.services.database.models.message.model import MessageTable


class CommentTable(SQLModel, table=True):
    """Model for storing message comments and scores"""
    __tablename__ = "comment"
    
    id: int | None = Field(default=None, primary_key=True)
    message_id: str = Field(foreign_key="message.id", index=True)
    score: float = Field(ge=0, le=100)
    comment_text: str | None = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(
        default_factory=lambda: datetime.utcnow(),
        sa_column=Column(DateTime, default=datetime.utcnow)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.utcnow(),
        sa_column=Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Add relationship if needed
    # message: "MessageTable" = Relationship(back_populates="comments")

    __table_args__ = (
        Index("idx_comment_message_id", "message_id"),
    )