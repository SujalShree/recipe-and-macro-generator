import React, { useState, useEffect } from 'react';
import { X, Target, Save } from 'lucide-react';

export default function UserTargetModal({
  isOpen,
  onClose,
  currentUser,
  onSaveTargets,
  isSaving
}) {
  const [formData, setFormData] = useState({
    name: 'User',
    target_calories: 2200,
    target_protein_g: 150,
    target_carbs_g: 200,
    target_fat_g: 60,
    dietary_preference: 'High Protein'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || 'User',
        target_calories: currentUser.target_calories || 2200,
        target_protein_g: currentUser.target_protein_g || 150,
        target_carbs_g: currentUser.target_carbs_g || 200,
        target_fat_g: currentUser.target_fat_g || 60,
        dietary_preference: currentUser.dietary_preference || 'High Protein'
      });
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTargets(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Target size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dietary Goals & Profile</h3>
              <p className="text-xs text-slate-500">Stored in PostgreSQL 'users' table to calibrate AI outputs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            id="btn-close-targets"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Profile Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Dietary Focus
            </label>
            <input
              type="text"
              value={formData.dietary_preference}
              onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
              placeholder="e.g. High Protein Clean, Non-Veg, Vegetarian"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                min="1000"
                max="6000"
                value={formData.target_calories}
                onChange={(e) => setFormData({ ...formData, target_calories: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Daily Protein (g)
              </label>
              <input
                type="number"
                min="30"
                max="400"
                value={formData.target_protein_g}
                onChange={(e) => setFormData({ ...formData, target_protein_g: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Daily Carbs (g)
              </label>
              <input
                type="number"
                min="20"
                max="600"
                value={formData.target_carbs_g}
                onChange={(e) => setFormData({ ...formData, target_carbs_g: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Daily Fats (g)
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={formData.target_fat_g}
                onChange={(e) => setFormData({ ...formData, target_fat_g: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              id="btn-save-targets"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Update Targets'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
