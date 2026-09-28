import React from 'react';
import { X, Trash2, Bookmark, Clock, ChevronRight, Utensils } from 'lucide-react';

export default function SavedRecipesModal({
  isOpen,
  onClose,
  recipes,
  onSelectRecipe,
  onDeleteRecipe,
  isLoading
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Bookmark size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Saved Recipes</h3>
              <p className="text-xs text-slate-500">Stored in your Neon PostgreSQL database ({recipes.length})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            id="btn-close-saved"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
              <span>Querying PostgreSQL database...</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
              <Utensils size={36} className="text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No Saved Recipes Yet</p>
              <p className="text-xs max-w-xs text-slate-500">
                Generate a recipe from your fridge staples and click "Save Recipe" to store it in Neon PostgreSQL.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recipes.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-3 transition-all"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectRecipe(item);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.meal_type || 'Recipe'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1 hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span><strong>{item.calories}</strong> kcal</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-semibold"><strong>{item.protein_grams}g</strong> Protein</span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{item.cook_time_minutes + item.prep_time_minutes}m</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onSelectRecipe(item);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Load this recipe"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteRecipe(item.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete from database"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
