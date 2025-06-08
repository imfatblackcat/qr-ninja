// API URLs and paths

// Detect production vs development environment
const isProduction = window.location.hostname === 'app.getrobo.xyz' || 
  window.location.hostname.includes('getrobo.xyz') || 
  !window.location.hostname.includes('localhost');

// Base API URLs
export const API_URL = isProduction
  ? 'https://app.getrobo.xyz/api'
  : 'https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes';

// API path suffix
export const API_PATH = '/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes';
