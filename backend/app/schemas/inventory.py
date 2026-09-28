from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class InventoryItemBase(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = "Fridge"

class InventoryItemCreate(InventoryItemBase):
    user_id: Optional[int] = 1

class InventoryItemResponse(InventoryItemBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class InventorySyncRequest(BaseModel):
    user_id: Optional[int] = 1
    items: List[str] = Field(default_factory=list, description="List of items currently in the user's fridge")
