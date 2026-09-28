import React, { useState, useEffect } from 'react';
import { Target, Save, User, PieChart, Activity, Check, LogIn } from 'lucide-react';

export default function ProfileView({
  currentUser,
  onSaveProfile,
  isSaving,
  onOpenAuth
}) {
  const [formData, setFormData] = useState({
    name: 'Guest Chef',
    target_calories: 2200,
    target_protein_g: 150,
    target_carbs_g: 200,
    target_fat_g: 60,
    dietary_preference: 'High Protein Clean'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        target_calories: currentUser.target_calories || 2200,
        target_protein_g: currentUser.target_protein_g || 150,
        target_carbs_g: currentUser.target_carbs_g || 200,
        target_fat_g: currentUser.target_fat_g || 60,
        dietary_preference: currentUser.dietary_preference || 'High Protein Clean'
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser && onOpenAuth) {
      onOpenAuth();
      return;
    }
    await onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const proteinCals = formData.target_protein_g * 4;
  const carbsCals = formData.target_carbs_g * 4;
  const fatCals = formData.target_fat_g * 9;
  const totalCalsFromMacros = proteinCals + carbsCals + fatCals;

  const proteinPct = totalCalsFromMacros > 0 ? Math.round((proteinCals / totalCalsFromMacros) * 100) : 0;
  const carbsPct = totalCalsFromMacros > 0 ? Math.round((carbsCals / totalCalsFromMacros) * 100) : 0;
  const fatPct = totalCalsFromMacros > 0 ? Math.round((fatCals / totalCalsFromMacros) * 100) : 0;

  const perMealProtein = Math.round(formData.target_protein_g / 3);
  const perMealCals = Math.round(formData.target_calories / 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Guest Notice */}
      {!currentUser && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-emerald-950">Save Your Personal Macro Profile</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Sign in or create a free account so your daily protein, calorie targets, and dietary preferences persist.
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
          <h2 className="text-xl font-bold text-slate-900">Your Nutrition Goals</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser 
              ? `Calibrated for ${currentUser.name} (${currentUser.email})`
              : 'Set your daily calorie and macronutrient targets. Generated recipes will be calibrated to these goals.'}
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-fade-in">
            <Check size={14} />
            <span>Goals updated successfully!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <span>Personal Targets</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dietary Preference
              </label>
              <input
                type="text"
                value={formData.dietary_preference}
                onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                placeholder="e.g. High Protein Non-Veg, Vegetarian, Clean Eating"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="6000"
                  value={formData.target_calories}
                  onChange={(e) => setFormData({ ...formData, target_calories: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Daily Protein Goal (grams)
                </label>
                <input
                  type="number"
                  min="30"
                  max="400"
                  value={formData.target_protein_g}
                  onChange={(e) => setFormData({ ...formData, target_protein_g: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Carbs Limit (grams)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={formData.target_carbs_g}
                  onChange={(e) => setFormData({ ...formData, target_carbs_g: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Healthy Fats (grams)
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={formData.target_fat_g}
                  onChange={(e) => setFormData({ ...formData, target_fat_g: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Goals'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Analytics Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <PieChart size={15} />
              <span>Target Energy Ratio</span>
            </h4>

            {/* Proportion Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
              <div style={{ width: `${proteinPct}%` }} className="bg-emerald-500 h-full" title={`Protein: ${proteinPct}%`} />
              <div style={{ width: `${carbsPct}%` }} className="bg-blue-500 h-full" title={`Carbs: ${carbsPct}%`} />
              <div style={{ width: `${fatPct}%` }} className="bg-amber-500 h-full" title={`Fat: ${fatPct}%`} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                <span className="block text-[11px] font-semibold text-emerald-700">Protein</span>
                <span className="text-base font-extrabold text-emerald-600">{proteinPct}%</span>
                <span className="block text-[10px] text-slate-400">{formData.target_protein_g}g</span>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
                <span className="block text-[11px] font-semibold text-blue-700">Carbs</span>
                <span className="text-base font-extrabold text-blue-600">{carbsPct}%</span>
                <span className="block text-[10px] text-slate-400">{formData.target_carbs_g}g</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
                <span className="block text-[11px] font-semibold text-amber-700">Fat</span>
                <span className="text-base font-extrabold text-amber-600">{fatPct}%</span>
                <span className="block text-[10px] text-slate-400">{formData.target_fat_g}g</span>
              </div>
            </div>
          </div>

          {/* Meal Split */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity size={15} />
              <span>Recommended Meal Target (3-Meal Split)</span>
            </h4>

            <p className="text-xs text-slate-500 leading-relaxed">
              To hit your daily goal comfortably, aim for this amount across each of your main meals:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-around text-center">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Target / Meal</span>
                <span className="text-lg font-extrabold text-emerald-600">~{perMealProtein}g</span>
                <span className="block text-[10px] text-slate-400 font-medium">Protein</span>
              </div>

              <div className="w-px h-8 bg-slate-200" />

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Budget / Meal</span>
                <span className="text-lg font-extrabold text-slate-800">~{perMealCals}</span>
                <span className="block text-[10px] text-slate-400 font-medium">Calories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
