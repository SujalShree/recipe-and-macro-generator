import React, { useState } from 'react';
import {
  Refrigerator,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Database,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Proteins',
  'Vegetables',
  'Dairy & Milks',
  'Grains & Pulses',
  'Spices & Seasonings',
  'Other'
];

export default function InventoryView({
  inventoryItems,
  onAddItem,
  onDeleteItem,
  onClearAll,
  onLoadIntoGenerator,
  isLoading
}) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Proteins');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim(), newItemCategory);
      setNewItemName('');
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category?.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Refrigerator size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">PostgreSQL Fridge Inventory</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Database size={11} /> Table: 'inventory'
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your persistent ingredients stored directly in your Neon PostgreSQL database.
            </p>
          </div>
        </div>

        {inventoryItems.length > 0 && (
          <button
            type="button"
            onClick={onLoadIntoGenerator}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Generate Recipe from Fridge ({inventoryItems.length} items)</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Add New Item & Category Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Ingredient Name
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Greek Yogurt, Chicken Breast, Spinach..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category
            </label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            >
              <option value="Proteins">🥩 Proteins</option>
              <option value="Vegetables">🥦 Vegetables</option>
              <option value="Dairy & Milks">🥛 Dairy & Milks</option>
              <option value="Grains & Pulses">🌾 Grains & Pulses</option>
              <option value="Spices & Seasonings">🌶️ Spices & Seasonings</option>
              <option value="Other">🧺 Other</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Add to DB</span>
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
          {CATEGORIES.map((cat) => {
            const count = cat === 'All'
              ? inventoryItems.length
              : inventoryItems.filter(i => i.category?.toLowerCase() === cat.toLowerCase()).length;
            const isActive = selectedFilter === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          {inventoryItems.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear Database</span>
            </button>
          )}
        </div>
      </div>

      {/* Database Inventory Items Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Stored Items ({filteredItems.length})
          </h3>
          <span className="text-xs text-slate-400">Synchronized with Neon PostgreSQL</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Refrigerator size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No Ingredients Stored in This Category</p>
            <p className="text-xs max-w-sm mx-auto text-slate-500 mt-1">
              Use the form above to add items to your Neon Postgres database, or load them directly into your recipe generator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-900 truncate">{item.item_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-medium">
                      {item.category || 'Fridge'}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  title="Remove from PostgreSQL"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
