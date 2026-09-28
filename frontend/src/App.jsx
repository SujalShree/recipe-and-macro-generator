import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IngredientSelector from './components/IngredientSelector';
import PreferenceControls from './components/PreferenceControls';
import RecipeDisplay from './components/RecipeDisplay';
import CookbookView from './components/CookbookView';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import {
  checkBackendHealth,
  generateRecipe,
  saveRecipeToDb,
  fetchSavedRecipes,
  deleteRecipeFromDb,
  fetchCurrentUser,
  logoutUser,
  updateUserSettings,
  fetchFridgeInventory,
  syncFridgeToPostgres
} from './services/api';

export default function App() {
  // Navigation: 'generator' | 'cookbook' | 'profile'
  const [activeTab, setActiveTab] = useState('generator');

  // Auth modal visibility
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 1. Ingredients in the user's fridge (EMPTY by default - NO prechosen data!)
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // 2. User's generation preferences
  const [preferences, setPreferences] = useState({
    meal_type: 'Any',
    cuisine_style: 'North Indian Homestyle',
    target_protein_g: 40,
    target_calories: '',
    spice_level: 'Medium'
  });

  // 3. Current active recipe (NULL by default - NO dummy data!)
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);

  // 4. Stored Data (Scoped to Authenticated User)
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [isSyncingFridge, setIsSyncingFridge] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Initial load: check JWT session
  useEffect(() => {
    async function initSession() {
      try {
        const user = await fetchCurrentUser();
        if (user) {
          setCurrentUser(user);
          if (user.target_protein_g) {
            setPreferences((prev) => ({
              ...prev,
              target_protein_g: Math.round(user.target_protein_g / 3)
            }));
          }
          // Fetch authenticated user's recipes & inventory
          const [recipes, inv] = await Promise.all([
            fetchSavedRecipes(user.id).catch(() => []),
            fetchFridgeInventory(user.id).catch(() => [])
          ]);
          setSavedRecipes(recipes || []);
          setInventoryItems(inv || []);
        } else {
          // Guest session: fresh start with 0 recipes and 0 pantry items
          setCurrentUser(null);
          setSavedRecipes([]);
          setInventoryItems([]);
        }
      } catch (err) {
        console.warn('Session init error:', err);
        setCurrentUser(null);
        setSavedRecipes([]);
        setInventoryItems([]);
      }
    }

    initSession();
  }, []);

  // --- Auth Handlers ---
  const handleAuthSuccess = async (user, msg) => {
    setCurrentUser(user);
    showToast(msg || `Welcome, ${user.name}!`);
    if (user.target_protein_g) {
      setPreferences((prev) => ({
        ...prev,
        target_protein_g: Math.round(user.target_protein_g / 3)
      }));
    }
    try {
      const [recipes, inv] = await Promise.all([
        fetchSavedRecipes(user.id).catch(() => []),
        fetchFridgeInventory(user.id).catch(() => [])
      ]);
      setSavedRecipes(recipes || []);
      setInventoryItems(inv || []);
    } catch (e) {
      console.warn('Could not sync user data:', e);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setSavedRecipes([]);
    setInventoryItems([]);
    showToast('👋 You have been logged out.');
  };

  // --- Ingredient Handlers ---
  const handleToggleIngredient = (item) => {
    const exists = selectedIngredients.some((i) => i.toLowerCase() === item.toLowerCase());
    if (exists) {
      setSelectedIngredients(selectedIngredients.filter((i) => i.toLowerCase() !== item.toLowerCase()));
    } else {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const handleAddCustom = (item) => {
    const exists = selectedIngredients.some((i) => i.toLowerCase() === item.toLowerCase());
    if (!exists) {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const handleClearIngredients = () => {
    setSelectedIngredients([]);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Save pantry staples
  const handleSavePantry = async () => {
    if (selectedIngredients.length === 0) return;
    if (!currentUser) {
      showToast('🔒 Please sign in to remember your pantry staples.');
      setIsAuthOpen(true);
      return;
    }
    setIsSyncingFridge(true);
    try {
      const saved = await syncFridgeToPostgres(selectedIngredients, currentUser.id);
      setInventoryItems(saved);
      showToast('📦 Pantry ingredients remembered for your next visits!');
    } catch (err) {
      showToast(`⚠️ Could not save pantry: ${err.message}`);
    } finally {
      setIsSyncingFridge(false);
    }
  };

  // Load saved pantry into active list
  const handleLoadPantry = () => {
    if (inventoryItems.length === 0) return;
    const names = inventoryItems.map((i) => i.item_name);
    setSelectedIngredients(names);
    showToast(`📥 Loaded ${names.length} pantry ingredients!`);
  };

  // --- Recipe Generation & Persistence ---
  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      showToast('⚠️ Please select or type at least one ingredient.');
      return;
    }

    setIsGenerating(true);
    setIsRecipeSaved(false);

    try {
      const payload = {
        ingredients: selectedIngredients,
        meal_type: preferences.meal_type === 'Any' ? 'Dinner' : preferences.meal_type,
        target_protein_g: preferences.target_protein_g ? Number(preferences.target_protein_g) : null,
        target_calories: preferences.target_calories ? Number(preferences.target_calories) : null,
        cuisine_style: preferences.cuisine_style,
        dietary_preference: currentUser?.dietary_preference || 'High Protein',
        spice_level: preferences.spice_level
      };

      const recipe = await generateRecipe(payload);
      setCurrentRecipe(recipe);
      showToast('✨ Custom recipe generated from your ingredients!');

      setTimeout(() => {
        const el = document.getElementById('recipe-result-card');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      showToast(`⚠️ Generation notice: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!currentRecipe || isRecipeSaved) return;
    if (!currentUser) {
      showToast('🔒 Sign in or create an account to save recipes to your cookbook.');
      setIsAuthOpen(true);
      return;
    }

    setIsSavingRecipe(true);
    try {
      const payload = {
        ...currentRecipe,
        user_id: currentUser.id
      };
      const saved = await saveRecipeToDb(payload);
      setIsRecipeSaved(true);
      setSavedRecipes((prev) => [saved, ...prev]);
      showToast('💾 Recipe saved to your personal cookbook!');
    } catch (err) {
      showToast(`⚠️ Save error: ${err.message}`);
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleDeleteSavedRecipe = async (id) => {
    try {
      await deleteRecipeFromDb(id);
      setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
      showToast('🗑️ Recipe removed from cookbook.');
    } catch (err) {
      showToast(`⚠️ Delete error: ${err.message}`);
    }
  };

  const handleSelectRecipeFromCookbook = (recipe) => {
    setCurrentRecipe(recipe);
    setIsRecipeSaved(true);
    setActiveTab('generator');
    showToast(`📖 Loaded '${recipe.title}'`);
  };

  // Save profile goals
  const handleSaveProfile = async (formData) => {
    if (!currentUser) {
      showToast('🔒 Please sign in to save your personal nutrition targets.');
      setIsAuthOpen(true);
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await updateUserSettings(currentUser.id, formData);
      setCurrentUser(updated);
      showToast('🎯 Nutrition goals updated!');
    } catch (err) {
      showToast(`⚠️ Profile error: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Consumer Header with Auth Trigger */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedRecipes.length}
        userTarget={currentUser}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 flex-1">
        {/* TAB 1: CREATE RECIPE */}
        {activeTab === 'generator' && (
          <div className="space-y-6 animate-fade-in">
            <IngredientSelector
              selectedIngredients={selectedIngredients}
              onToggleIngredient={handleToggleIngredient}
              onAddCustom={handleAddCustom}
              onClearAll={handleClearIngredients}
              onSaveToPostgres={handleSavePantry}
              onLoadFromPostgres={handleLoadPantry}
              savedInventoryCount={inventoryItems.length}
              isSyncing={isSyncingFridge}
            />

            <PreferenceControls
              preferences={preferences}
              onChange={handlePreferenceChange}
              onGenerate={handleGenerate}
              isLoading={isGenerating}
              ingredientCount={selectedIngredients.length}
            />

            <RecipeDisplay
              recipe={currentRecipe}
              onSave={handleSaveRecipe}
              isSaving={isSavingRecipe}
              isSaved={isRecipeSaved}
              userTarget={currentUser}
            />
          </div>
        )}

        {/* TAB 2: MY COOKBOOK */}
        {activeTab === 'cookbook' && (
          <CookbookView
            recipes={savedRecipes}
            onSelectRecipe={handleSelectRecipeFromCookbook}
            onDeleteRecipe={handleDeleteSavedRecipe}
            onSwitchToGenerator={() => setActiveTab('generator')}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* TAB 3: NUTRITION GOALS */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onSaveProfile={handleSaveProfile}
            isSaving={isSavingProfile}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Clean Consumer Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>
          © 2026 FridgeMacro • Smart Healthy Cooking & Macro Management
        </p>
      </footer>
    </div>
  );
}
