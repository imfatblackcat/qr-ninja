/**
 * Uniwersalny proxy dla klienta brain, który zapewnia poprawne adresowanie API w środowisku produkcyjnym
 * System automatycznego fallbacku dla wszystkich metod brain
 */

import brain from 'brain';
import { API_URL } from './api';

// Funkcja do wrapowania odpowiedzi HTTP w przypadku gdy oryginalny klient brain nie działa
const proxyFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Poprawione budowanie URL do API
    const url = endpoint.startsWith('/') 
      ? `${API_URL}${endpoint}` 
      : `${API_URL}/${endpoint}`;
      
    console.log(`Proxy fetch requesting: ${url}`);
    
    return await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  } catch (error) {
    console.error(`Error fetching from proxy: ${error}`);
    throw error;
  }
};

// Proxy dla metody get_products
export const getProducts = async (params: any) => {
  try {
    // Najpierw spróbuj użyć oryginalnego klienta brain
    console.log('Trying to get products using brain client with params:', params);
    return await brain.get_products(params);
  } catch (error) {
    console.error('Error using brain client, falling back to proxy', error);
    
    // Przepakowanie parametrów dla zgodności z API
    const storeHash = params.store_hash || params.storeHash;
    if (!storeHash) {
      console.error('No store_hash provided to getProducts');
      throw new Error('Store hash is required');
    }
    
    // Fallback na własną implementację
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.category_id) queryParams.append('category_id', params.category_id.toString());
    
    // Poprawiony endpoint zgodny ze strukturą API
    return await proxyFetch(`bigcommerce/products/${storeHash}?${queryParams.toString()}`);
  }
};

// Proxy dla metody get_categories
export const getCategories = async (params: any) => {
  try {
    // Najpierw spróbuj użyć oryginalnego klienta brain
    console.log('Trying to get categories using brain client with params:', params);
    return await brain.get_categories(params);
  } catch (error) {
    console.error('Error using brain client, falling back to proxy', error);
    
    // Przepakowanie parametrów dla zgodności z API
    const storeHash = params.store_hash || params.storeHash;
    if (!storeHash) {
      console.error('No store_hash provided to getCategories');
      throw new Error('Store hash is required');
    }
    
    // Fallback na własną implementację
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.parent_id) queryParams.append('parent_id', params.parent_id.toString());
    
    // Poprawiony endpoint zgodny ze strukturą API
    return await proxyFetch(`bigcommerce/categories/${storeHash}?${queryParams.toString()}`);
  }
};

// Proxy dla metody create_cart
export const createCart = async (params: any) => {
  try {
    // Najpierw spróbuj użyć oryginalnego klienta brain
    console.log('Trying to create cart using brain client with params:', params);
    return await brain.create_cart(params);
  } catch (error) {
    console.error('Error using brain client, falling back to proxy', error);
    
    // Przepakowanie parametrów dla zgodności z API
    const storeHash = params.store_hash || params.storeHash;
    if (!storeHash) {
      console.error('No store_hash provided to createCart');
      throw new Error('Store hash is required');
    }
    
    // Fallback na własną implementację
    return await proxyFetch(`bigcommerce/cart/create/${storeHash}`, {
      method: 'POST',
      body: JSON.stringify({
        product_id: params.product_id,
        quantity: params.quantity || 1
      }),
    });
  }
};

// Stworzenie uniwersalnego proxy dla wszystkich metod brain
// To pozwala używać brainProxy dokładnie tak samo jak brain
type BrainProxy = typeof brain;

// Stworzenie proxy dla każdej metody w brain
const createProxyMethod = (methodName: string) => {
  return async (...args: any[]) => {
    try {
      // @ts-ignore - Dynamicznie wywołujemy metodę z brain
      return await (brain as any)[methodName](...args);
    } catch (error) {
      console.error(`Error using brain.${methodName}, checking for custom fallback`, error);
      
      // Sprawdź czy istnieje dedykowana implementacja w tym module
      // @ts-ignore - Dynamicznie sprawdzamy czy istnieje metoda
      if (typeof exports[methodName] === 'function') {
        console.log(`Found custom implementation for ${methodName}, using it`);
        // @ts-ignore - Dynamicznie wywołujemy niestandardową implementację
        return await exports[methodName](...args);
      }
      
      // Nie znaleziono dedykowanej implementacji, rzucamy błąd
      console.error(`No fallback implementation for ${methodName}`);
      throw error;
    }
  };
};

// Tworzymy obiekt proxy
const brainProxy = Object.create(null);

// Kopiujemy wszystkie metody z oryginalnego klienta brain
Object.keys(brain).forEach((key) => {
  // @ts-ignore - Dynamiczne tworzenie metod
  if (typeof brain[key] === 'function') {
    // @ts-ignore - Dynamiczne przypisanie metody
    brainProxy[key] = createProxyMethod(key);
  }
});

// Dodajemy specyficzne implementacje
brainProxy.get_products = getProducts;
brainProxy.get_categories = getCategories;
brainProxy.create_cart = createCart;

// Eksport jako domyślny
export default brainProxy as BrainProxy;

// Eksport pojedynczych metod dla kompatybilności wstecznej
export { getProducts, getCategories, createCart };
