/**
 * Utility functions for managing store context across the application
 */

/**
 * Get the current store hash from localStorage with fallback to a default value
 * @param defaultHash Optional default hash to use if no store hash is found
 * @returns The store hash or default value
 */
export const getStoreHash = (defaultHash: string = ""): string => {
  const storeHash = localStorage.getItem("storeHash");
  
  if (storeHash) {
    return storeHash;
  }
  
  // No store hash in localStorage
  return defaultHash;
};

/**
 * Check if the app has a valid store context
 * @returns true if the app has a valid store context
 */
export const hasStoreContext = (): boolean => {
  return !!localStorage.getItem("storeHash");
};

/**
 * Get the BigCommerce authorization URL for app installation
 * @returns Promise that resolves to the auth URL
 */
export const getAuthUrl = async (): Promise<string> => {
  try {
    const response = await fetch('/api/auth-url');
    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error getting auth URL:', error);
    throw error;
  }
};

/**
 * Redirect to the BigCommerce authorization page
 */
export const redirectToAuth = async (): Promise<void> => {
  try {
    const authUrl = await getAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error redirecting to auth:', error);
    // Redirect to installation page as fallback
    window.location.href = "/installation";
  }
};
