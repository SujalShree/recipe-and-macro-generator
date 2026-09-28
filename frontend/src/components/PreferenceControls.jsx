import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';

const MEAL_TYPES = ['Any', 'Breakfast', 'Lunch', 'Dinner', 'Post-Workout Snack'];
const CUISINE_STYLES = [
  'North Indian Homestyle',
  'Punjabi Dhaba',
  'Tandoori Roast / Tikka',
  'High-Protein Kadai'
];

export default function PreferenceControls({
  preferences,
  onChange,
  onGenerate,
  isLoading,
  ingredientCount
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 sm:p-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Meal Preferences</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Choose your meal type and target protein, or leave flexible.
          </p>
        </div>
      </div>

      <div className="py-4 space-y-4">
        {/* Meal Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Meal Type
          </label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((m) => {
              const isActive = preferences.meal_type === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange('meal_type', m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flavor Profile */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Flavor Style
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_STYLES.map((c) => {
              const isActive = preferences.cuisine_style === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange('cuisine_style', c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Protein and Calories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Protein Goal (per serving)
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                min="15"
                max="120"
                value={preferences.target_protein_g || ''}
                onChange={(e) => onChange('target_protein_g', e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 40"
                className="w-full px-3.5 py-2 pr-14 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
              <span className="absolute right-3.5 text-xs font-medium text-slate-400 pointer-events-none">
                grams
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Calorie Budget (optional)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="200"
                max="1200"
                value={preferences.target_calories || ''}
                onChange={(e) => onChange('target_calories', e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2 pr-14 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
              <span className="absolute right-3.5 text-xs font-medium text-slate-400 pointer-events-none">
                kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || ingredientCount === 0}
          className="w-full sm:max-w-md py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          id="btn-generate-recipe"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Crafting your custom recipe...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Recipe</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-700/60">
                {ingredientCount} {ingredientCount === 1 ? 'ingredient' : 'ingredients'}
              </span>
            </>
          )}
        </button>

        {ingredientCount === 0 && (
          <p className="text-xs text-slate-400">
            Select or type at least one ingredient above to begin.
          </p>
        )}
      </div>
    </div>
  );
}
