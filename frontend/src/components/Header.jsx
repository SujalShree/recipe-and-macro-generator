import React from 'react';
import { ChefHat, BookmarkCheck, Target, Sparkles, User, LogIn, LogOut } from 'lucide-react';

export default function Header({
  activeTab,
  onTabChange,
  savedCount,
  userTarget,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onTabChange('generator')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <ChefHat size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">FridgeMacro</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Smart AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Turn what's in your fridge into high-protein healthy meals</p>
            </div>
          </div>

          {/* Navigation & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onTabChange('generator')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles size={15} />
                <span>Create Recipe</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('cookbook')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'cookbook'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookmarkCheck size={15} />
                <span>My Cookbook</span>
                {savedCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'cookbook' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onTabChange('profile')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Target size={15} />
                <span className="hidden sm:inline">My Goals</span>
                {userTarget?.target_protein_g && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'profile' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {Math.round(userTarget.target_protein_g)}g
                  </span>
                )}
              </button>
            </nav>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

            {/* Auth Actions */}
            {currentUser && currentUser.email ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTabChange('profile')}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Your account"
                >
                  <User size={13} className="text-emerald-600" />
                  <span className="max-w-[100px] truncate">{currentUser.name || 'Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                id="btn-sign-in"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
