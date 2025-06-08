import { API_URL } from "./api";

/**
 * Generates a standardized tracking URL for QR codes that works in both development and production environments
 * @param qrCodeId - The ID of the QR code
 * @param storeHash - The store hash
 * @returns Properly formatted tracking URL
 */
export const generateTrackingUrl = (qrCodeId: string, storeHash: string): string => {
  // Detect environment
  const isProduction = window.location.hostname === 'app.getrobo.xyz' || 
    window.location.hostname.includes('getrobo.xyz') || 
    !window.location.hostname.includes('localhost');
    
  // In production, use the /api/track/ endpoint
  if (isProduction) {
    return `https://app.getrobo.xyz/api/track/${qrCodeId}?store_hash=${storeHash}`;
  }
  
  // In development, use the full API URL path
  return `${API_URL}/track/${qrCodeId}?store_hash=${storeHash}`;
};

/**
 * Generates a URL for fetching QR code images
 * @param qrCodeId - The ID of the QR code
 * @param format - The image format (svg, png)
 * @param size - The size of the image in pixels
 * @returns URL for the QR code image
 */
export const getQrImageUrl = (qrCodeId: string, format: string = 'svg', size: number = 250): string => {
  // Detect environment
  const isProduction = window.location.hostname === 'app.getrobo.xyz' || 
    window.location.hostname.includes('getrobo.xyz') || 
    !window.location.hostname.includes('localhost');
    
  // In production, use the direct /api prefix for image URLs
  if (isProduction) {
    return `https://app.getrobo.xyz/api/qr-image/${qrCodeId}.${format}?size=${size}`;
  }
  
  // In development, use the API_URL
  return `${API_URL}/qr-image/${qrCodeId}.${format}?size=${size}`;
};
