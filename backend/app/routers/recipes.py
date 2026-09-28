from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipe import Recipe
from app.models.user import User
from app.core.security import get_current_user_optional
from app.schemas.recipe import (
    RecipeGenerateRequest,
    GeneratedRecipe,
    RecipeSaveRequest,
    RecipeResponse,
)
from app.services.generator import generate_recipe_with_groq

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

@router.post("/generate", response_model=GeneratedRecipe, summary="Generate high-protein North Indian recipe using Groq LLM")
async def generate_recipe(request: RecipeGenerateRequest):
    """
    Generates an authentic high-protein North Indian recipe based on available ingredients and macro goals.
    Strictly validates output using Pydantic and Groq structured inference.
    """
    if not request.ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one ingredient or protein staple must be provided."
        )
    return await generate_recipe_with_groq(request)

@router.post("/save", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED, summary="Save recipe to Neon Postgres")
def save_recipe(
    recipe_in: RecipeSaveRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Persists a generated recipe into the PostgreSQL database.
    Stores ingredients and instructions as JSONB structures.
    """
    target_user_id = current_user.id if current_user else (recipe_in.user_id or 1)
    db_recipe = Recipe(
        user_id=target_user_id,
        title=recipe_in.title,
        description=recipe_in.description,
        cuisine=recipe_in.cuisine,
        meal_type=recipe_in.meal_type,
        prep_time_minutes=recipe_in.prep_time_minutes,
        cook_time_minutes=recipe_in.cook_time_minutes,
        servings=recipe_in.servings,
        calories=recipe_in.macros.calories,
        protein_grams=recipe_in.macros.protein_grams,
        carb_grams=recipe_in.macros.carb_grams,
        fat_grams=recipe_in.macros.fat_grams,
        fiber_grams=recipe_in.macros.fiber_grams,
        ingredients=[item.model_dump() for item in recipe_in.ingredients],
        instructions=[step.model_dump() for step in recipe_in.instructions],
        tags=recipe_in.tags,
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.get("/", response_model=List[RecipeResponse], summary="List all saved recipes")
def get_recipes(
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    target_user_id = user_id if user_id is not None else (current_user.id if current_user else None)
    if target_user_id is None:
        # Guests without an account or user ID see an empty personal cookbook
        return []
        
    recipes = (
        db.query(Recipe)
        .filter(Recipe.user_id == target_user_id)
        .order_by(Recipe.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return recipes

@router.get("/{recipe_id}", response_model=RecipeResponse, summary="Get recipe by ID")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    return recipe

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete recipe")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return None
