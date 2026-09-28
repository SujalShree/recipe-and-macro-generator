from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- Ingredient & Step Sub-Models ---

class IngredientItem(BaseModel):
    item: str = Field(..., description="Name of the ingredient (e.g., Chicken Breast, Low-fat Paneer)")
    quantity: str = Field(..., description="Measurement amount (e.g., 250, 2, 1/2)")
    unit: str = Field(..., description="Unit of measurement (e.g., g, ml, tbsp, pieces, pinch)")
    notes: Optional[str] = Field(None, description="Optional preparation note (e.g., cubed, finely chopped, whisked)")

class InstructionStep(BaseModel):
    step: int = Field(..., description="Step sequence number (1, 2, 3...)")
    text: str = Field(..., description="Detailed culinary instruction")
    tip: Optional[str] = Field(None, description="Chef tip for retaining moisture, flavor, or texture")

class MacroBreakdown(BaseModel):
    calories: int = Field(..., ge=0, description="Estimated calories per single serving")
    protein_grams: float = Field(..., ge=0, description="Protein in grams per single serving")
    carb_grams: float = Field(..., ge=0, description="Carbohydrates in grams per single serving")
    fat_grams: float = Field(..., ge=0, description="Fat in grams per single serving")
    fiber_grams: float = Field(default=0.0, ge=0, description="Dietary fiber in grams per single serving")

# --- Structured AI Output Schema (Used with LangChain / Groq) ---

class GeneratedRecipe(BaseModel):
    title: str = Field(..., description="Authentic, appetizing recipe title highlighting North Indian spices & protein")
    description: str = Field(..., description="2-3 sentence overview highlighting the North Indian flavor profile and nutritional benefit")
    cuisine: str = Field(default="North Indian", description="Culinary style (e.g., North Indian Punjabi, Tandoori Roast, Mughlai Fit)")
    meal_type: str = Field(default="Dinner", description="Meal type: Breakfast, Lunch, Dinner, or Post-Workout Snack")
    prep_time_minutes: int = Field(..., ge=1, description="Active prep time in minutes")
    cook_time_minutes: int = Field(..., ge=1, description="Cooking time in minutes")
    servings: int = Field(default=2, ge=1, description="Total servings produced by the recipe")
    macros: MacroBreakdown = Field(..., description="Strict nutritional breakdown per serving")
    ingredients: List[IngredientItem] = Field(..., min_length=2, description="List of ingredients with precise quantities")
    instructions: List[InstructionStep] = Field(..., min_length=2, description="Step-by-step cooking steps")
    tags: List[str] = Field(default_factory=list, description="Tags like high-protein, gym-diet, quick, north-indian")

# --- Client Request & Response Schemas ---

class RecipeGenerateRequest(BaseModel):
    ingredients: List[str] = Field(
        ...,
        min_length=1,
        description="List of available staple ingredients (e.g. ['chicken breast', 'curd', 'garam masala', 'kasuri methi'])"
    )
    meal_type: Optional[str] = Field("Dinner", description="Breakfast, Lunch, Dinner, or Snack")
    target_protein_g: Optional[float] = Field(None, description="Optional desired protein target per serving (in grams)")
    target_calories: Optional[int] = Field(None, description="Optional calorie budget per serving")
    cuisine_style: Optional[str] = Field("North Indian", description="North Indian, Punjabi Dhaba Style, Tandoori Grill, Homestyle Tadka")
    dietary_preference: Optional[str] = Field("High Protein", description="e.g. High-Protein Non-Veg, Vegetarian, Eggitarian")
    spice_level: Optional[str] = Field("Medium", description="Mild, Medium, Spicy, or Desi Teekha")

class RecipeSaveRequest(GeneratedRecipe):
    user_id: Optional[int] = Field(None, description="User ID to associate the recipe with")

class RecipeResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    cuisine: str
    meal_type: str
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    calories: int
    protein_grams: float
    carb_grams: float
    fat_grams: float
    fiber_grams: float
    ingredients: List[IngredientItem]
    instructions: List[InstructionStep]
    tags: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
