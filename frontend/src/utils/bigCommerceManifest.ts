/**
 * BigCommerce App Manifest Reference
 * 
 * This file contains the JSON structure for the BigCommerce app manifest.
 * Use this as a reference when configuring your app in the BigCommerce Developer Portal.
 * 
 * Note: Replace placeholder values (${PLACEHOLDERS}) with your actual values before submission.
 */

export const BIGCOMMERCE_APP_MANIFEST = {
  "name": "BigCommerce App",
  "description": "A simple BigCommerce app that displays 'Hello World' in your store admin panel.",
  "version": "1.0.0",
  "author": {
    "name": "Mariusz Charkot",
    "email": "your-email@example.com",
    "url": "https://your-website.com"
  },
  "capabilities": {
    "name": "BigCommerce App",
    "mount": {
      "iframe": true,
      "iframe_url": "{{APP_URL}}/hello-world"
    }
  },
  "icon_url": "https://example.com/app-icon.png", // Replace with your app icon URL
  "auth": {
    "auth_callback_uri": "https://app.getrobo.xyz/api/auth_callback",
    "load_callback_uri": "https://app.getrobo.xyz/api/load"
    // Note: We don't have an uninstall endpoint implemented yet
  },
  "oauth": {
    "client_id": "{{BIGCOMMERCE_CLIENT_ID}}", // Will be provided by BigCommerce
    "client_secret": "{{BIGCOMMERCE_CLIENT_SECRET}}", // Will be provided by BigCommerce
    "scopes": [
      "store_v2_content",
      "store_v2_information"
    ]
  },
  "settings": {
    "single_click_install": true
  },
  "content_security_policy": {
    "default_src": ["'self'", "*.bigcommerce.com", "{{APP_DOMAIN}}"],
    "script_src": ["'self'", "'unsafe-inline'", "*.bigcommerce.com", "{{APP_DOMAIN}}"],
    "style_src": ["'self'", "'unsafe-inline'", "*.bigcommerce.com", "{{APP_DOMAIN}}"],
    "img_src": ["'self'", "*.bigcommerce.com", "{{APP_DOMAIN}}", "data:"],
    "connect_src": ["'self'", "*.bigcommerce.com", "{{APP_DOMAIN}}"],
    "frame_ancestors": ["'self'", "*.bigcommerce.com"]
  },
  "app_category": "Other",
  "feature": "app_feature_other"
};

/**
 * How to use this manifest:
 * 
 * 1. Copy the JSON object above (without the export statement)
 * 2. Replace all placeholder values ({{PLACEHOLDERS}})
 *    - APP_URL: Your deployed app URL (e.g., https://app.getrobo.xyz)
 *    - APP_DOMAIN: Your app's domain without protocol (e.g., app.getrobo.xyz)
 *    - BIGCOMMERCE_CLIENT_ID: Will be provided by BigCommerce during app creation
 *    - BIGCOMMERCE_CLIENT_SECRET: Will be provided by BigCommerce during app creation
 * 3. Submit the JSON in the BigCommerce Developer Portal when creating/updating your app
 */