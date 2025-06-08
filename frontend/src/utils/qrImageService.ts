import { API_URL } from './api';

// Use the API_URL from constants instead of hardcoding the URLs
export const API_BASE_URL = API_URL;

/**
 * Get the URL for a QR code image
 */
export const getQrImageUrl = (qrCodeId: string, format: 'png' | 'svg', size: number = 300): string => {
  return `${API_BASE_URL}/qr-image/${qrCodeId}.${format}?size=${size}`;
};
