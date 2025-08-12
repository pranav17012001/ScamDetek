// Session storage utility for storing API responses during the browser session
const sessionStorage = {
  // Get data from session storage
  get(key) {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from session storage:', error);
      return null;
    }
  },

  // Set data in session storage
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to session storage:', error);
    }
  },

  // Remove data from session storage
  remove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from session storage:', error);
    }
  },

  // Clear all data from session storage
  clear() {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }
};

export default sessionStorage; 