const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.FRONTEND_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://recipe-and-macro-generator.onrender.com');

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Health & Telemetry ---
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      database_connected: false,
      groq_configured: false,
      error: err.message,
    };
  }
}

export async function fetchSystemStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/system/stats`);
    if (!res.ok) throw new Error('Stats failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

// --- Authentication (Login & Signup) ---

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed. Please check your credentials.');
  }
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed.');
  }
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      return null;
    }
    const user = await res.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (e) {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

// --- Recipe Endpoints ---

export async function generateRecipe(payload) {
  const res = await fetch(`${API_BASE_URL}/api/recipes/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate recipe');
  }
  return await res.json();
}

export async function saveRecipeToDb(recipeData) {
  const res = await fetch(`${API_BASE_URL}/api/recipes/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(recipeData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to save recipe');
  }
  return await res.json();
}

export async function fetchSavedRecipes(userId) {
  const url = userId ? `${API_BASE_URL}/api/recipes/?user_id=${userId}` : `${API_BASE_URL}/api/recipes/`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return await res.json();
}

export async function deleteRecipeFromDb(recipeId) {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
  return true;
}

// --- User Profile & Dietary Goals ---

export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/api/users/`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return await res.json();
}

export async function updateUserSettings(userId, data) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update targets');
  return await res.json();
}

// --- Fridge / Pantry Inventory ---

export async function fetchFridgeInventory(userId = 1) {
  const res = await fetch(`${API_BASE_URL}/api/inventory/?user_id=${userId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch pantry inventory');
  return await res.json();
}

export async function syncFridgeToPostgres(items, userId = 1) {
  const res = await fetch(`${API_BASE_URL}/api/inventory/sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId, items }),
  });
  if (!res.ok) throw new Error('Failed to sync pantry inventory');
  return await res.json();
}

export async function addFridgeItem(itemName, category = 'Fridge', userId = 1) {
  const res = await fetch(`${API_BASE_URL}/api/inventory/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId, item_name: itemName, category }),
  });
  if (!res.ok) throw new Error('Failed to add item');
  return await res.json();
}

export async function removeFridgeItem(itemId) {
  const res = await fetch(`${API_BASE_URL}/api/inventory/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to remove item');
  return true;
}
