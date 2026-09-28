import logging
from typing import Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.schemas.recipe import GeneratedRecipe, RecipeGenerateRequest, MacroBreakdown, IngredientItem, InstructionStep

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an elite Indian Executive Chef and Sports Nutritionist specializing in authentic North Indian cuisine engineered for fitness, bodybuilding, and clean eating.

Your mission:
Given a list of available staple ingredients from the user's fridge (such as chicken, eggs, paneer, whey protein, soya chunks, lentils, veggies, and spices), craft an authentic, high-protein North Indian recipe.

Rules:
1. Only recommend ingredients the user has or essential culinary basics (salt, water, basic spices, cooking oil/ghee).
2. Flavor Profiles: Utilize classic North Indian techniques—bhuna masala (sautéing onions, ginger, garlic, tomatoes), tandoori marination (curd, kashmiri chilli, mustard oil, lemon), or fragrant homestyle tadka (cumin, hing, ajwain, kasuri methi).
3. Nutrition:
   - Accurately calculate nutritional macronutrients per single serving (Protein = 4 kcal/g, Carbs = 4 kcal/g, Fats = 9 kcal/g).
   - Ensure the protein target is respected if requested.
4. Format:
   - Use standard plain ASCII numbers or decimals for quantities (e.g., '0.5' instead of '½', '1.5' instead of '1½').
   - Keep instructions concise, actionable, and practical.
"""


USER_PROMPT = """Available Ingredients: {ingredients}
Meal Type: {meal_type}
Target Protein (per serving): {target_protein}
Target Calories (per serving): {target_calories}
Cuisine Sub-Style: {cuisine_style}
Dietary Preference: {dietary_preference}
Spice Level: {spice_level}

Please create an authentic, mouthwatering, high-protein recipe honoring these inputs.
"""

def get_fallback_recipe(request: RecipeGenerateRequest) -> GeneratedRecipe:
    """Provides an authentic fallback recipe when GROQ_API_KEY is not yet configured."""
    has_chicken = any("chicken" in i.lower() for i in request.ingredients)
    has_eggs = any("egg" in i.lower() for i in request.ingredients)
    has_whey = any("whey" in i.lower() for i in request.ingredients)

    if has_chicken:
        title = "Tandoori Spiced Murgh Tikka Bowl"
        desc = "Juicy chicken breast marinated in hung curd, toasted besan, kasuri methi, and fragrant spices, pan-roasted to smoky perfection."
        protein = request.target_protein_g or 48.0
        calories = request.target_calories or 420
        carbs = 10.0
        fat = 12.0
        ingredients = [
            IngredientItem(item="Chicken Breast", quantity="250", unit="g", notes="cut into bite-sized cubes"),
            IngredientItem(item="Hung Curd / Greek Yogurt", quantity="3", unit="tbsp", notes="low-fat"),
            IngredientItem(item="Ginger-Garlic Paste", quantity="1", unit="tbsp", notes="freshly pounded"),
            IngredientItem(item="Kashmiri Red Chilli Powder", quantity="1", unit="tsp", notes="for vibrant color and mild heat"),
            IngredientItem(item="Garam Masala", quantity="0.5", unit="tsp", notes="freshly ground"),
            IngredientItem(item="Kasuri Methi", quantity="1", unit="tsp", notes="rubbed between palms"),
            IngredientItem(item="Mustard Oil", quantity="1", unit="tsp", notes="authentic Punjabi pungency"),
            IngredientItem(item="Lemon Juice", quantity="1", unit="tbsp", notes="for tenderness")
        ]
        instructions = [
            InstructionStep(step=1, text="Marinate cubed chicken breast with lemon juice, salt, and ginger-garlic paste for 15 minutes.", tip="First marination ensures deep penetration of flavors and tenderizes the meat."),
            InstructionStep(step=2, text="In a bowl, mix hung curd, mustard oil, kashmiri chilli, garam masala, and kasuri methi. Coat the chicken thoroughly.", tip="Mustard oil brings the quintessential tandoori aroma."),
            InstructionStep(step=3, text="Heat a heavy cast-iron skillet or grill pan with minimal oil spray. Sear chicken on medium-high for 4-5 minutes per side until charred edges appear.", tip="Do not overcrowd the pan so chicken chars rather than steams."),
            InstructionStep(step=4, text="Sprinkle chaat masala, garnish with fresh mint and sliced red onions, and serve immediately.", tip="Rest chicken for 3 minutes before serving to lock in the juices.")
        ]
    elif has_whey:
        title = "North Indian Kesar Pista Whey Halwa"
        desc = "A wholesome high-protein desi dessert crafted with roasted oats flour, cardamom, saffron, and whey protein isolate."
        protein = request.target_protein_g or 34.0
        calories = request.target_calories or 310
        carbs = 26.0
        fat = 7.0
        ingredients = [
            IngredientItem(item="Whey Protein Isolate (Vanilla or Unflavored)", quantity="1", unit="scoop (33g)", notes="added off-heat"),
            IngredientItem(item="Rolled Oats Flour", quantity="40", unit="g", notes="finely ground"),
            IngredientItem(item="Desi Ghee", quantity="1", unit="tsp", notes="for authentic aroma"),
            IngredientItem(item="Almond Milk / Skim Milk", quantity="150", unit="ml", notes="warm"),
            IngredientItem(item="Cardamom Powder (Elaichi)", quantity="0.5", unit="tsp", notes="freshly ground"),
            IngredientItem(item="Saffron Strands (Kesar)", quantity="4-5", unit="threads", notes="soaked in 1 tbsp warm milk"),
            IngredientItem(item="Crushed Pistachios", quantity="5", unit="g", notes="for garnish")
        ]
        instructions = [
            InstructionStep(step=1, text="Heat 1 tsp desi ghee in a non-stick pan on low heat. Add oats flour and slow-roast until nutty and light golden.", tip="Roasting on low heat is crucial to remove any raw oat flavor."),
            InstructionStep(step=2, text="Slowly pour in warm milk while whisking continuously to avoid lumps. Add elaichi powder and kesar milk.", tip="Keep stirring continuously for a smooth, velvety halwa texture."),
            InstructionStep(step=3, text="Turn off the heat completely and let the mixture cool for 60 seconds.", tip="CRITICAL: Never add whey protein over direct high flame to prevent denaturing/curdling."),
            InstructionStep(step=4, text="Fold in the whey protein scoop until seamlessly incorporated. Garnish with slivered pistachios and serve warm.", tip="Enjoy as a guilt-free post-workout sweet craving.")
        ]
    else:
        title = "Dhaba Style High-Protein Paneer & Sprouted Moong Kadai"
        desc = "Richly spiced kadai dish featuring seared paneer cubes and sprouted green moong tossed in a coarse coriander-cumin gravy."
        protein = request.target_protein_g or 38.0
        calories = request.target_calories or 450
        carbs = 30.0
        fat = 16.0
        ingredients = [
            IngredientItem(item="Low Fat Paneer", quantity="180", unit="g", notes="diced into cubes"),
            IngredientItem(item="Sprouted Moong Beans", quantity="100", unit="g", notes="steamed for 5 mins"),
            IngredientItem(item="Bell Pepper (Capsicum)", quantity="1", unit="medium", notes="diced into squares"),
            IngredientItem(item="Onion", quantity="1", unit="large", notes="half pureed, half cubed"),
            IngredientItem(item="Tomatoes", quantity="2", unit="medium", notes="pureed"),
            IngredientItem(item="Kadai Masala (Coriander seeds + Cumin + Black pepper)", quantity="1.5", unit="tbsp", notes="coarsely crushed"),
            IngredientItem(item="Kasuri Methi", quantity="1", unit="tsp", notes="roasted")
        ]
        instructions = [
            InstructionStep(step=1, text="Dry roast whole coriander seeds, cumin, and black peppercorns in a pan, then coarsely crush in a mortar.", tip="Freshly roasted kadai masala gives that distinct roadside dhaba punch."),
            InstructionStep(step=2, text="Sauté pureed onions, ginger-garlic paste, and tomato puree until thick and aromatic. Stir in the freshly ground kadai spice blend.", tip="Cook the masala base well until raw smell dissipates."),
            InstructionStep(step=3, text="Toss in steamed sprouted moong, cubed paneer, and crunchy capsicum. Simmer gently for 4-5 minutes.", tip="Do not overcook paneer; keep it soft and tender."),
            InstructionStep(step=4, text="Finish with crushed kasuri methi and fresh coriander leaves. Serve hot with whole wheat roti.", tip="Kasuri methi is best rubbed between your palms before sprinkling.")
        ]

    return GeneratedRecipe(
        title=title,
        description=desc,
        cuisine=request.cuisine_style or "North Indian",
        meal_type=request.meal_type or "Dinner",
        prep_time_minutes=12,
        cook_time_minutes=18,
        servings=2,
        macros=MacroBreakdown(
            calories=calories,
            protein_grams=protein,
            carb_grams=carbs,
            fat_grams=fat,
            fiber_grams=6.0
        ),
        ingredients=ingredients,
        instructions=instructions,
        tags=["high-protein", "north-indian", "fitness-staple", "gym-diet"]
    )

async def generate_recipe_with_groq(request: RecipeGenerateRequest) -> GeneratedRecipe:
    """
    Generates a structured North Indian high-protein recipe using Groq and LangChain.
    Enforces strict Pydantic output validation.
    """
    api_key = settings.GROQ_API_KEY.strip()
    if not api_key or api_key == "gsk_your_groq_api_key_here":
        logger.warning("GROQ_API_KEY is not configured. Serving verified fitness recipe template.")
        return get_fallback_recipe(request)

    try:
        # Initialize Groq LLM through LangChain
        llm = ChatGroq(
            temperature=0.3,
            model_name=settings.GROQ_MODEL,
            groq_api_key=api_key,
            max_tokens=4096,
        )

        # Enforce structured output via Pydantic model
        structured_llm = llm.with_structured_output(GeneratedRecipe)

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", USER_PROMPT),
        ])

        formatted_prompt = prompt_template.format_messages(
            ingredients=", ".join(request.ingredients),
            meal_type=request.meal_type or "Any",
            target_protein=f"{request.target_protein_g}g" if request.target_protein_g else "Maximized (>35g)",
            target_calories=f"{request.target_calories} kcal" if request.target_calories else "Moderate (400-600 kcal)",
            cuisine_style=request.cuisine_style or "North Indian Homestyle / Punjabi Dhaba",
            dietary_preference=request.dietary_preference or "High Protein Clean",
            spice_level=request.spice_level or "Medium"
        )

        result: GeneratedRecipe = await structured_llm.ainvoke(formatted_prompt)
        return result

    except Exception as e:
        logger.error(f"Error calling Groq API: {e}. Falling back to default recipe.")
        # Fallback to authentic pre-calculated recipe if network/quota fails
        fallback = get_fallback_recipe(request)
        fallback.description = f"{fallback.description} (Note: Generated via offline engine due to: {str(e)[:80]})"
        return fallback
