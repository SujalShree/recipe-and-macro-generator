-- ====================================================================
-- Recipe & Macro Generator - Database Initialization Script
-- Compatible with Neon PostgreSQL & pgAdmin 4
-- ====================================================================

-- 1. Enable UUID extension (optional helper)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-initializing (safe order)
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create 'users' table (Dietary targets & user preferences)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    target_calories INTEGER NOT NULL DEFAULT 2200,
    target_protein_g NUMERIC(5, 1) NOT NULL DEFAULT 160.0,
    target_carbs_g NUMERIC(5, 1) NOT NULL DEFAULT 200.0,
    target_fat_g NUMERIC(5, 1) NOT NULL DEFAULT 60.0,
    dietary_preference VARCHAR(100) DEFAULT 'High Protein North Indian',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create 'recipes' table (Nutritional macros, JSON ingredients & steps)
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cuisine VARCHAR(100) DEFAULT 'North Indian',
    meal_type VARCHAR(50) DEFAULT 'Dinner',
    prep_time_minutes INTEGER DEFAULT 15,
    cook_time_minutes INTEGER DEFAULT 25,
    servings INTEGER DEFAULT 2,
    calories INTEGER NOT NULL,
    protein_grams NUMERIC(5, 1) NOT NULL,
    carb_grams NUMERIC(5, 1) NOT NULL,
    fat_grams NUMERIC(5, 1) NOT NULL,
    fiber_grams NUMERIC(5, 1) DEFAULT 5.0,
    -- JSONB Columns for flexible structured AI outputs
    ingredients JSONB NOT NULL,
    instructions JSONB NOT NULL,
    tags JSONB DEFAULT '["high-protein", "north-indian"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Performance Indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_protein ON recipes(protein_grams DESC);
-- GIN Index on JSONB columns for fast ingredient searches
CREATE INDEX idx_recipes_ingredients ON recipes USING GIN (ingredients);

-- 6. Seed Initial Demo User
INSERT INTO users (name, email, target_calories, target_protein_g, target_carbs_g, target_fat_g, dietary_preference)
VALUES (
    'Sujal Fitness',
    'sujal@example.com',
    2400,
    180.0,
    220.0,
    65.0,
    'High Protein North Indian (Gym Staple)'
);

-- 7. Seed Initial Sample Recipe (Tandoori Style High-Protein Paneer & Egg Bhurji)
INSERT INTO recipes (
    user_id,
    title,
    description,
    cuisine,
    meal_type,
    prep_time_minutes,
    cook_time_minutes,
    servings,
    calories,
    protein_grams,
    carb_grams,
    fat_grams,
    fiber_grams,
    ingredients,
    instructions,
    tags
) VALUES (
    1,
    'Amritsari High-Protein Paneer & Egg Bhurji',
    'Classic North Indian spiced scramble loaded with egg whites and crumbled low-fat paneer, infused with kasuri methi and roasted cumin.',
    'North Indian Punjabi',
    'Dinner',
    10,
    15,
    2,
    460,
    44.0,
    12.0,
    22.0,
    3.5,
    '[
        {"item": "Low Fat Paneer", "quantity": "150", "unit": "g", "notes": "crumbled"},
        {"item": "Whole Eggs", "quantity": "2", "unit": "pieces", "notes": "whisked"},
        {"item": "Egg Whites", "quantity": "3", "unit": "pieces", "notes": "for pure protein boost"},
        {"item": "Onion", "quantity": "1", "unit": "medium", "notes": "finely chopped"},
        {"item": "Tomato", "quantity": "1", "unit": "medium", "notes": "finely chopped"},
        {"item": "Green Chillies", "quantity": "2", "unit": "pieces", "notes": "slit"},
        {"item": "Kasuri Methi", "quantity": "1", "unit": "tsp", "notes": "crushed"},
        {"item": "Garam Masala", "quantity": "0.5", "unit": "tsp", "notes": "roasted"},
        {"item": "Mustard Oil / Ghee", "quantity": "1", "unit": "tsp", "notes": "for tempering"}
    ]'::jsonb,
    '[
        {"step": 1, "text": "Heat 1 tsp mustard oil in a heavy kadai until fragrant. Add cumin seeds and chopped green chillies.", "tip": "Let mustard oil smoke gently to remove raw pungent bite."},
        {"step": 2, "text": "Add chopped onions and sauté until golden brown. Toss in chopped tomatoes, turmeric, red chilli powder, and salt.", "tip": "Cook tomatoes until soft and oil separates slightly."},
        {"step": 3, "text": "Pour in whisked whole eggs and extra egg whites. Scramble gently over medium heat for 2 minutes.", "tip": "Do not overcook the eggs before adding the paneer."},
        {"step": 4, "text": "Fold in the crumbled paneer, kasuri methi, and garam masala. Toss for 2 more minutes until well blended.", "tip": "Keep the texture soft and juicy."},
        {"step": 5, "text": "Garnish with fresh coriander and serve hot with multi-grain roti or as a bowl meal.", "tip": "Pairs great with homemade mint yogurt chutney."}
    ]'::jsonb,
    '["high-protein", "north-indian", "post-workout", "quick"]'::jsonb
);
