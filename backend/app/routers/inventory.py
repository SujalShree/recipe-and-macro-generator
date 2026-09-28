from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.inventory import InventoryItem
from app.models.user import User
from app.core.security import get_current_user_optional
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventorySyncRequest,
)

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.get("/", response_model=List[InventoryItemResponse], summary="Get user's fridge inventory")
def get_inventory(
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Fetch all ingredients stored in the user's fridge inventory from PostgreSQL."""
    target_user_id = user_id if user_id is not None else (current_user.id if current_user else None)
    if target_user_id is None:
        return []
    return db.query(InventoryItem).filter(InventoryItem.user_id == target_user_id).order_by(InventoryItem.created_at.desc()).all()

@router.post("/", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED, summary="Add item to fridge inventory")
def add_inventory_item(item_in: InventoryItemCreate, db: Session = Depends(get_db)):
    """Add a new ingredient to the user's fridge inventory."""
    existing = db.query(InventoryItem).filter(
        InventoryItem.user_id == item_in.user_id,
        InventoryItem.item_name.ilike(item_in.item_name)
    ).first()
    if existing:
        return existing

    new_item = InventoryItem(
        user_id=item_in.user_id or 1,
        item_name=item_in.item_name.strip(),
        category=item_in.category or "Fridge"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.post("/sync", response_model=List[InventoryItemResponse], summary="Sync entire fridge inventory")
def sync_inventory(sync_req: InventorySyncRequest, db: Session = Depends(get_db)):
    """
    Overwrites/syncs the user's saved fridge inventory in Neon PostgreSQL
    with the current list of active fridge ingredients.
    """
    uid = sync_req.user_id or 1
    # Remove existing inventory for this user
    db.query(InventoryItem).filter(InventoryItem.user_id == uid).delete()
    
    saved_items = []
    for item in sync_req.items:
        clean = item.strip()
        if clean:
            inv = InventoryItem(user_id=uid, item_name=clean, category="Fridge")
            db.add(inv)
            saved_items.append(inv)
            
    db.commit()
    for inv in saved_items:
        db.refresh(inv)
    return saved_items

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove item from inventory")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in inventory")
    db.delete(item)
    db.commit()
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT, summary="Clear user's fridge inventory")
def clear_inventory(user_id: Optional[int] = 1, db: Session = Depends(get_db)):
    db.query(InventoryItem).filter(InventoryItem.user_id == user_id).delete()
    db.commit()
    return None
