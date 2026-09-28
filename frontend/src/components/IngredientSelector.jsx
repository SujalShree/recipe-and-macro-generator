import React, { useState, useMemo } from 'react';
import {
  Refrigerator,
  Search,
  Plus,
  X,
  BookmarkPlus,
  RotateCcw,
  Trash2,
  Check
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🧺' },
  { id: 'protein', label: 'Proteins', icon: '🥩' },
  { id: 'veg', label: 'Veggies', icon: '🥦' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛' },
  { id: 'grains', label: 'Grains & Carbs', icon: '🌾' },
  { id: 'spices', label: 'Spices & Flavors', icon: '🌶️' },
];

const STAPLES = [
  // Proteins
  { name: 'Chicken Breast', category: 'protein' },
  { name: 'Whole Eggs', category: 'protein' },
  { name: 'Egg Whites', category: 'protein' },
  { name: 'Low Fat Paneer', category: 'protein' },
  { name: 'Paneer', category: 'protein' },
  { name: 'Soya Chunks', category: 'protein' },
  { name: 'Whey Protein', category: 'protein' },
  { name: 'Greek Yogurt', category: 'protein' },
  { name: 'Fish Fillet', category: 'protein' },
  { name: 'Tofu', category: 'protein' },
  { name: 'Moong Sprouts', category: 'protein' },

  // Vegetables
  { name: 'Tomatoes', category: 'veg' },
  { name: 'Onions', category: 'veg' },
  { name: 'Spinach', category: 'veg' },
  { name: 'Bell Pepper (Capsicum)', category: 'veg' },
  { name: 'Garlic & Ginger', category: 'veg' },
  { name: 'Green Chillies', category: 'veg' },
  { name: 'Mushrooms', category: 'veg' },
  { name: 'Broccoli', category: 'veg' },
  { name: 'Green Peas', category: 'veg' },
  { name: 'Carrots', category: 'veg' },
  { name: 'Fresh Coriander', category: 'veg' },

  // Dairy & Milks
  { name: 'Curd / Dahi', category: 'dairy' },
  { name: 'Milk', category: 'dairy' },
  { name: 'Almond Milk', category: 'dairy' },
  { name: 'Cheese Slice', category: 'dairy' },
  { name: 'Ghee', category: 'dairy' },

  // Grains & Carbs
  { name: 'Oats', category: 'grains' },
  { name: 'Brown Rice', category: 'grains' },
  { name: 'Basmati Rice', category: 'grains' },
  { name: 'Quinoa', category: 'grains' },
  { name: 'Yellow Moong Dal', category: 'grains' },
  { name: 'Chickpeas (Chana)', category: 'grains' },
  { name: 'Kidney Beans (Rajma)', category: 'grains' },
  { name: 'Besan (Gram Flour)', category: 'grains' },

  // Spices & Flavors
  { name: 'Kasuri Methi', category: 'spices' },
  { name: 'Garam Masala', category: 'spices' },
  { name: 'Jeera (Cumin)', category: 'spices' },
  { name: 'Red Chilli Powder', category: 'spices' },
  { name: 'Turmeric (Haldi)', category: 'spices' },
  { name: 'Chaat Masala', category: 'spices' },
  { name: 'Mustard Oil', category: 'spices' },
  { name: 'Lemon Juice', category: 'spices' }
];

export default function IngredientSelector({
  selectedIngredients,
  onToggleIngredient,
  onAddCustom,
  onClearAll,
  onSaveToPostgres,
  onLoadFromPostgres,
  savedInventoryCount,
  isSyncing
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');

  const filteredStaples = useMemo(() => {
    return STAPLES.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (clean) {
      onAddCustom(clean);
      setCustomInput('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900">What ingredients do you have?</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Select or type ingredients from your fridge. We'll generate a macro-friendly recipe using them.
          </p>
        </div>

        {/* Pantry Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {savedInventoryCount > 0 && (
            <button
              type="button"
              onClick={onLoadFromPostgres}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title="Load your saved staples"
            >
              <RotateCcw size={13} />
              <span>Load My Pantry ({savedInventoryCount})</span>
            </button>
          )}

          {selectedIngredients.length > 0 && (
            <>
              <button
                type="button"
                onClick={onSaveToPostgres}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Save this list for future sessions"
              >
                <BookmarkPlus size={13} />
                <span>{isSyncing ? 'Saving...' : 'Remember My Pantry'}</span>
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Ingredients Tray */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>In Your Fridge ({selectedIngredients.length})</span>
          {selectedIngredients.length === 0 && (
            <span className="text-slate-400 font-normal">Your fridge is empty. Add or tap items below to get started.</span>
          )}
        </div>

        {selectedIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs transition-all animate-fade-in"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onToggleIngredient(item)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition-colors cursor-pointer"
                  title={`Remove ${item}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Input & Search */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Quick Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staples (e.g. chicken, egg, oats)..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Or type any ingredient and press Enter..."
              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Staples Cloud */}
        <div className="pt-3.5">
          <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
            {filteredStaples.map((staple) => {
              const isSelected = selectedIngredients.some(
                (i) => i.toLowerCase() === staple.name.toLowerCase()
              );
              return (
                <button
                  key={staple.name}
                  type="button"
                  onClick={() => onToggleIngredient(staple.name)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold ring-1 ring-emerald-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span>{staple.name}</span>
                  {isSelected ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Plus size={12} className="text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
