# 🍗 MasalaMacro AI — Recipe & Macro Generator

> **AI-Powered High-Protein North Indian Recipe Engine & Macronutrient Tracker**  
> Built with **FastAPI**, **Neon PostgreSQL**, **Groq (LLaMA-3.3-70B)**, **LangChain**, and **Vite + React**.

---

## 🏗️ Architecture Overview

```
RECIPE AND MACRO GENERATOR/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py             # App & environment configuration
│   │   │   └── database.py           # SQLAlchemy Neon Postgres engine
│   │   ├── models/
│   │   │   ├── user.py               # 'users' table (dietary goals & macros)
│   │   │   └── recipe.py             # 'recipes' table (JSONB steps & macros)
│   │   ├── schemas/
│   │   │   ├── user.py               # Pydantic schemas for targets
│   │   │   └── recipe.py             # Strict Pydantic models for Groq output
│   │   ├── services/
│   │   │   └── generator.py          # LangChain ChatGroq structured inference
│   │   ├── routers/
│   │   │   ├── recipes.py            # /api/recipes endpoints
│   │   │   └── users.py              # /api/users endpoints
│   │   └── main.py                   # FastAPI entry point & CORS
│   ├── sql/
│   │   └── init_db.sql               # Ready-to-run DDL for pgAdmin / Neon SQL
│   ├── .env.example
│   ├── .env
│   └── requirements.txt
├── frontend/                         # Vite + React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Branding & live status badges
│   │   │   ├── IngredientSelector.jsx# Staple pantry chips & custom tags
│   │   │   ├── PreferenceControls.jsx# Sliders & North Indian style selectors
│   │   │   ├── RecipeDisplay.jsx     # Macro dashboard & kitchen steps checklist
│   │   │   ├── SavedRecipesModal.jsx # Stored Neon Postgres recipes
│   │   │   └── UserTargetModal.jsx   # Daily protein & calorie targets
│   │   ├── services/
│   │   │   └── api.js                # API client with FastAPI
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## ⚡ Quickstart Guide (From Scratch)

### 1. Database & pgAdmin Setup (Neon PostgreSQL)

1. **Create Free Neon Database**:
   - Go to [neon.tech](https://neon.tech) and create a free serverless PostgreSQL database.
   - Note your Connection String (e.g., `postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require`).

2. **Connect via pgAdmin 4**:
   - Open **pgAdmin 4** on your PC.
   - Right-click **Servers** > **Register** > **Server...**
   - In the **General** tab: Name it `Neon Postgres`.
   - In the **Connection** tab:
     - **Host**: Enter your host from the Neon connection string (e.g., `ep-sample.us-east-2.aws.neon.tech`)
     - **Port**: `5432`
     - **Maintenance database**: `neondb`
     - **Username**: `neondb_owner`
     - **Password**: Your database password
     - **SSL Mode**: Select `Require`
   - Click **Save**.

3. **Initialize the Tables**:
   - In pgAdmin (or Neon's web SQL Editor), open the Query Tool on `neondb`.
   - Open and execute the script:
     [backend/sql/init_db.sql](file:///c:/Users/shree/OneDrive/Desktop/SUJAL/CODES/RECIPE%20AND%20MACRO%20GENERATOR/backend/sql/init_db.sql)
   - This creates both relational tables:
     - `users` (daily targets: calories, protein, carbs, fats)
     - `recipes` (macros, `JSONB` ingredients, `JSONB` instructions, and indexes).

4. **Update `backend/.env`**:
   - Paste your Neon connection string into `DATABASE_URL` in [backend/.env](file:///c:/Users/shree/OneDrive/Desktop/SUJAL/CODES/RECIPE%20AND%20MACRO%20GENERATOR/backend/.env).

---

### 2. Groq API Key Setup

1. Go to [console.groq.com/keys](https://console.groq.com/keys) (Free tier available).
2. Create an API key (`gsk_...`).
3. Paste it into `GROQ_API_KEY` in [backend/.env](file:///c:/Users/shree/OneDrive/Desktop/SUJAL/CODES/RECIPE%20AND%20MACRO%20GENERATOR/backend/.env):
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

---

### 3. Running the Backend (FastAPI)

In a terminal:
```powershell
cd backend
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- API Health: `http://localhost:8000/health`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

---

### 4. Running the Frontend (Vite + React)

In a second terminal:
```powershell
cd frontend
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

### 5. Deploying to Vercel

1. Push this project to GitHub.
2. Go to [vercel.com](https://vercel.com) > **Add New Project**.
3. Select your repository and set the **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL` = Your deployed FastAPI backend URL.
5. Click **Deploy**!
