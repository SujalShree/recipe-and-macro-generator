from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, default=1)
    item_name = Column(String(100), nullable=False)
    category = Column(String(50), default="Fridge")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="inventory_items")
