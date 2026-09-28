import React, { useState, useMemo } from 'react';
import {
  BookmarkCheck,
  Search,
  Clock,
  Flame,
  Users,
  Trash2,
  ChevronRight,
  ArrowUpDown,
  Utensils,
  LogIn
} from 'lucide-react';

export default function CookbookView({
  recipes,
  onSelectRecipe,
  onDeleteRecipe,
  onSwitchToGenerator,
  currentUser,
  onOpenAuth
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((r) => {
        const matchesMeal = selectedMealType === 'All' || r.meal_type?.toLowerCase() === selectedMealType.toLowerCase();
        const matchesSearch = searchQuery.trim() === '' ||
          r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesMeal && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'protein') {
          return (b.protein_grams || 0) - (a.protein_grams || 0);
        }
        if (sortBy === 'calories') {
          return (a.calories || 0) - (b.calories || 0);
        }
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [recipes, searchQuery, selectedMealType, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Guest Notice if not logged in */}
      {!currentUser && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-emerald-950">Save Your Recipes Privately</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Sign in or create a free account so your generated high-protein recipes and cookbook stay saved to your account.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <LogIn size={13} />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Cookbook</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser 
              ? `${currentUser.name}'s collection of saved recipes and macro breakdowns (${recipes.length} total).`
              : `Your personal collection of saved recipes and macro breakdowns (${recipes.length} total).`}
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToGenerator}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Utensils size={15} />
          <span>Create New Recipe</span>
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved recipes by name..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>

        {/* Meal Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Post-Workout Snack'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMealType(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedMealType === m
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <ArrowUpDown size={13} className="text-slate-400" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="newest">Newest</option>
            <option value="protein">Highest Protein</option>
            <option value="calories">Lowest Calories</option>
          </select>
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
          <BookmarkCheck size={40} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Saved Recipes Yet</p>
          <p className="text-xs max-w-sm mx-auto text-slate-500 mt-1">
            Generate recipes from your ingredients and tap "Save to Cookbook" to collect them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-4"
            >
              <div>
                {/* Badges & Date */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {recipe.meal_type || 'Recipe'}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {recipe.cuisine || 'North Indian'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                  {recipe.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {recipe.description}
                </p>

                {/* Specs */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    <span>{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} className="text-slate-400" />
                    <span>{recipe.servings} Servings</span>
                  </span>
                </div>

                {/* Macros Pills */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Calories</span>
                    <span className="text-sm font-extrabold text-slate-800">{recipe.calories}</span>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-2">
                    <span className="block text-[10px] uppercase font-semibold text-emerald-600">Protein</span>
                    <span className="text-sm font-extrabold text-emerald-600">{recipe.protein_grams}g</span>
                  </div>
                  <div className="bg-blue-50/70 rounded-lg p-2">
                    <span className="block text-[10px] uppercase font-semibold text-blue-600">Carbs</span>
                    <span className="text-sm font-extrabold text-blue-600">{recipe.carb_grams}g</span>
                  </div>
                  <div className="bg-amber-50/70 rounded-lg p-2">
                    <span className="block text-[10px] uppercase font-semibold text-amber-600">Fat</span>
                    <span className="text-sm font-extrabold text-amber-600">{recipe.fat_grams}g</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onDeleteRecipe(recipe.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectRecipe(recipe)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Open Recipe</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
