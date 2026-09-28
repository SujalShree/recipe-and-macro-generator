from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class UserBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: Optional[EmailStr] = None
    target_calories: int = Field(2200, ge=1000, le=6000)
    target_protein_g: float = Field(160.0, ge=30, le=400)
    target_carbs_g: float = Field(200.0, ge=20, le=600)
    target_fat_g: float = Field(60.0, ge=10, le=200)
    dietary_preference: Optional[str] = "High Protein North Indian"

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    target_calories: Optional[int] = None
    target_protein_g: Optional[float] = None
    target_carbs_g: Optional[float] = None
    target_fat_g: Optional[float] = None
    dietary_preference: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
