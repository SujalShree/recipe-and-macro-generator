from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cuisine = Column(String(100), default="North Indian")
    meal_type = Column(String(50), default="Dinner")
    prep_time_minutes = Column(Integer, default=15)
    cook_time_minutes = Column(Integer, default=25)
    servings = Column(Integer, default=2)
    
    # Nutritional Breakdown (Per Serving)
    calories = Column(Integer, nullable=False)
    protein_grams = Column(Float, nullable=False)
    carb_grams = Column(Float, nullable=False)
    fat_grams = Column(Float, nullable=False)
    fiber_grams = Column(Float, default=4.0)

    # JSON structures for flexible arrays
    ingredients = Column(JSON, nullable=False)   # List of {item, quantity, unit, notes}
    instructions = Column(JSON, nullable=False)  # List of {step, text, tip}
    tags = Column(JSON, default=list)            # List of string tags

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="recipes")
