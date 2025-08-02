export const STORAGE_KEYS = {
  FAVORITES: 'chess-favorites',
  MIGRATION_COMPLETED: 'migration-completed'
};

// Keep existing localStorage functions for backward compatibility
export const loadFavorites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Error loading favorites:', error);
    return [];
  }
};

export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Error saving favorites:', error);
  }
};

export const clearFavorites = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETED, 'true');
  } catch (error) {
    console.warn('Error clearing favorites:', error);
  }
};

export const isMigrationCompleted = () => {
  return localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETED) === 'true';
};