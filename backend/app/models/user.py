from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    target_calories = Column(Integer, nullable=False, default=2200)
    target_protein_g = Column(Float, nullable=False, default=160.0)
    target_carbs_g = Column(Float, nullable=False, default=200.0)
    target_fat_g = Column(Float, nullable=False, default=60.0)
    dietary_preference = Column(String(100), default="High Protein North Indian")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")
