/**
 * Proxy dla klienta brain, który zapewnia poprawne adresowanie API w środowisku produkcyjnym
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

// Proxy dla delete_qr_code - dodana nowa funkcja
export const deleteQrCode = async (params: { qrCodeId: string, hard_delete?: boolean }) => {
  try {
    // Najpierw spróbuj użyć oryginalnego klienta brain
    console.log('Trying to delete QR code using brain client with params:', params);
    return await brain.delete_qr_code(params);
  } catch (error) {
    console.error('Error using brain client, falling back to proxy', error);
    
    // Weryfikacja parametrów
    const { qrCodeId, hard_delete } = params;
    if (!qrCodeId) {
      console.error('No qrCodeId provided to deleteQrCode');
      throw new Error('QR code ID is required');
    }
    
    // Utworzenie query params jeśli potrzebne
    const queryParams = new URLSearchParams();
    if (hard_delete) queryParams.append('hard_delete', 'true');
    
    // Bezpośrednie wywołanie API z poprawnym URL
    return await proxyFetch(`qr-code/${qrCodeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      method: 'DELETE',
    });
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
