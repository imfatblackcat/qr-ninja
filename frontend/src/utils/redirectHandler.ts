/**
 * Utility for handling redirects
 */

/**
 * Normalizes a URL to ensure it's properly formatted
 * @param url The URL to normalize
 * @returns A properly formatted URL, either absolute or relative to the current origin
 */
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  
  console.log('🔄 Normalizing URL:', url);
  
  // If it's an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL, combine with origin
  const origin = window.location.origin;
  const baseUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const relativeUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${relativeUrl}`;
};

/**
 * Performs a redirect to the specified URL
 * @param url The URL to redirect to
 */
const performRedirect = (url: string): void => {
  const normalizedUrl = normalizeUrl(url);
  console.log('🔄 Redirecting to:', normalizedUrl);
  window.location.href = normalizedUrl;
};

/**
 * Checks a Response object for redirect headers or JSON redirect content
 * and performs a redirect if needed
 * 
 * @param response The fetch Response object to check
 * @returns Promise<boolean> - true if a redirect was performed, false otherwise
 */
export const handleRedirectResponse = async (response: Response): Promise<boolean> => {
  console.log('🔄 Redirect check - Response status:', response.status);
  
  // Check standard HTTP redirects
  if (response.redirected) {
    console.log('🔄 HTTP redirect detected to:', response.url);
    performRedirect(response.url);
    return true;
  }
  
  // No redirect found - backend now uses direct HTTP redirects exclusively
  // which will be automatically handled by the browser without this handler
  return false;
};

/**
 * Simplified function that determines if the current page should check for redirects
 * @returns boolean - true if we should check for redirect
 */
export const shouldCheckForRedirect = (): boolean => {
  // Special BigCommerce parameters that indicate we need redirect handling
  const queryParams = new URLSearchParams(window.location.search);
  const hasBigCommerceParams = (
    queryParams.has('context') || 
    queryParams.has('app_load') || 
    queryParams.has('code') || 
    queryParams.has('scope')
  );
  
  if (hasBigCommerceParams) {
    console.log('🔎 BigCommerce parameters detected, checking for redirects');
    return true;
  }
  
  // Pages related to auth flow always check for redirects
  const pathname = window.location.pathname.toLowerCase();
  const authRelatedPages = [
    '/hello-world', 
    '/auth_callback', 
    '/load'
  ];
  
  for (const page of authRelatedPages) {
    if (pathname === page || pathname.startsWith(page + '/') || pathname.startsWith(page + '?')) {
      console.log(`🔎 Auth-related page detected: ${page}`);
      return true;
    }
  }
  
  // API response detection
  if (pathname.includes('/api/') || pathname.includes('/routes/') || pathname.includes('/auth')) {
    console.log('🔎 API endpoint detected, checking for redirects');
    return true;
  }
  
  // Not a page that needs redirect handling
  return false;
};
