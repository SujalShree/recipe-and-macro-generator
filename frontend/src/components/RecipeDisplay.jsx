import React, { useState } from 'react';
import {
  Clock,
  Users,
  Flame,
  Check,
  CheckCircle2,
  Bookmark,
  Share2,
  Lightbulb,
  Utensils
} from 'lucide-react';

export default function RecipeDisplay({
  recipe,
  onSave,
  isSaving,
  isSaved
}) {
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  const [copied, setCopied] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  if (!recipe) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-10 sm:p-14 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
          <Utensils size={28} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Your Recipe Will Appear Here</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
          Select what ingredients you have above and tap <strong>Generate Recipe</strong>. We'll craft a customized meal with complete step-by-step instructions and macros.
        </p>
      </div>
    );
  }

  const { macros } = recipe;
  const scaledCalories = Math.round((macros.calories || 0) * scaleMultiplier);
  const scaledProtein = Number(((macros.protein_grams || 0) * scaleMultiplier).toFixed(1));
  const scaledCarbs = Number(((macros.carb_grams || 0) * scaleMultiplier).toFixed(1));
  const scaledFat = Number(((macros.fat_grams || 0) * scaleMultiplier).toFixed(1));
  const scaledServings = (recipe.servings || 1) * scaleMultiplier;

  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (stepNum) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const totalSteps = recipe.instructions.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const handleCopy = () => {
    const text = `🍽️ ${recipe.title}
🔥 Calories: ${scaledCalories} kcal | Protein: ${scaledProtein}g | Carbs: ${scaledCarbs}g | Fat: ${scaledFat}g
⏱️ Prep: ${recipe.prep_time_minutes}m | Cook: ${recipe.cook_time_minutes}m | Servings: ${scaledServings}

🛒 Ingredients:
${recipe.ingredients.map((i) => `• ${i.quantity} ${i.unit} ${i.item} ${i.notes ? `(${i.notes})` : ''}`).join('\n')}

👨‍🍳 Steps:
${recipe.instructions.map((s) => `${s.step}. ${s.text} ${s.tip ? `[Tip: ${s.tip}]` : ''}`).join('\n')}

Created with FridgeMacro`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 animate-fade-in" id="recipe-result-card">
      {/* Top Badges & Actions */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {recipe.meal_type || 'Recipe'}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {recipe.cuisine || 'North Indian'}
          </span>
          {macros?.protein_grams >= 30 && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              High Protein ({macros.protein_grams}g)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            id="btn-copy-recipe"
            title="Copy recipe to clipboard"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving || isSaved}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-900 hover:bg-slate-800 disabled:opacity-50'
            }`}
            id="btn-save-recipe"
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={14} />
                <span>Saved to Cookbook</span>
              </>
            ) : isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Bookmark size={14} />
                <span>Save to Cookbook</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Title & Specs */}
      <div className="pt-4 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-tight">
          {recipe.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-4">
          {recipe.description}
        </p>

        {/* Specs & Serving Scaler */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-4 text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400" />
              <span>Prep: <strong className="text-slate-900">{recipe.prep_time_minutes}m</strong></span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Flame size={15} className="text-amber-500" />
              <span>Cook: <strong className="text-slate-900">{recipe.cook_time_minutes}m</strong></span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={15} className="text-emerald-600" />
              <span>Yield: <strong className="text-slate-900">{scaledServings} {scaledServings === 1 ? 'Serving' : 'Servings'}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Portions:</span>
            {[1, 2, 4].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => setScaleMultiplier(mult)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                  scaleMultiplier === mult
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Macronutrient Cards */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          <span>Nutritional Facts {scaleMultiplier > 1 ? `(${scaleMultiplier}x Portions)` : '(Per Serving)'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Calories</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-slate-900">{scaledCalories}</span>
              <span className="text-xs font-semibold text-slate-500">kcal</span>
            </div>
            <span className="text-[11px] text-slate-400">Energy</span>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-3.5 flex flex-col justify-between ring-1 ring-emerald-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Protein</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-emerald-600">{scaledProtein}</span>
              <span className="text-xs font-semibold text-emerald-700">g</span>
            </div>
            <span className="text-[11px] text-emerald-600">Muscle Fuel</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Carbs</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-blue-600">{scaledCarbs}</span>
              <span className="text-xs font-semibold text-blue-700">g</span>
            </div>
            <span className="text-[11px] text-blue-500">Daily Energy</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Healthy Fats</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-extrabold text-amber-600">{scaledFat}</span>
              <span className="text-xs font-semibold text-amber-700">g</span>
            </div>
            <span className="text-[11px] text-amber-600">Essential Nutrients</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Ingredients Checklist & Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients */}
        <div>
          <div className="flex items-baseline justify-between pb-2 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Ingredients ({recipe.ingredients.length})
            </h3>
            <span className="text-xs text-slate-400">Tap to check off</span>
          </div>

          <ul className="space-y-2">
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = !!checkedIngredients[idx];
              return (
                <li
                  key={idx}
                  onClick={() => toggleIngredient(idx)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} />}
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900">{ing.quantity} {ing.unit}</span>
                    <span className="font-medium text-slate-700">{ing.item}</span>
                    {ing.notes && <span className="text-xs text-slate-400">({ing.notes})</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-baseline justify-between pb-2 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Cooking Method ({recipe.instructions.length} Steps)
            </h3>
            <span className="text-xs font-semibold text-emerald-600">
              {completedCount} of {totalSteps} done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-3">
            {recipe.instructions.map((step) => {
              const isDone = !!completedSteps[step.step];
              return (
                <div
                  key={step.step}
                  onClick={() => toggleStep(step.step)}
                  className={`flex gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {isDone ? <Check size={12} /> : step.step}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <p className={`leading-relaxed text-slate-800 ${isDone ? 'line-through' : ''}`}>
                      {step.text}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border-l-2 border-amber-500 text-xs text-amber-900">
                        <Lightbulb size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Chef Tip:</strong> {step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
