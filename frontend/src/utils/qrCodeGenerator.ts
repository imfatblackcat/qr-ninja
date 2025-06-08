/**
 * QR Code Generator Utility
 * 
 * Provides enhanced QR code generation functions with advanced styling options.
 */

import qrcode from 'qrcode';

interface QRCodeStyle {
  foreground_color: string;
  background_color: string;
  dots_style: string;
  corner_style: string;
  logo_url?: string;
  logo_size: number;
}

interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  style?: QRCodeStyle;
}

/**
 * Generates a QR code as a data URL
 */
export const generateQRCodeDataURL = async (
  text: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const { width = 300, margin = 4, errorCorrectionLevel = 'M', style } = options;
  
  const qrOptions = {
    width,
    margin,
    errorCorrectionLevel,
    color: {
      dark: style?.foreground_color || '#000000',
      light: style?.background_color || '#FFFFFF'
    }
  };

  try {
    return await qrcode.toDataURL(text, qrOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Apply custom styling to a QR code on a canvas
 */
export const applyQRCodeStyling = (
  canvas: HTMLCanvasElement,
  style: QRCodeStyle
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      const width = canvas.width;
      const height = canvas.height;

      // Add logo if provided
      if (style.logo_url && style.logo_size > 0) {
        const logoSize = style.logo_size * (width / 10); // Scale from 1-10
        const logoX = (width - logoSize) / 2;
        const logoY = (height - logoSize) / 2;

        const logo = new Image();
        logo.crossOrigin = 'Anonymous';
        
        logo.onload = () => {
          // Create circular logo with white border
          ctx.save();
          
          // Draw white background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Create circular clip for logo
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
          ctx.clip();
          
          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();
          
          resolve();
        };
        
        logo.onerror = () => {
          console.error('Error loading logo image');
          resolve(); // Continue without logo
        };
        
        logo.src = style.logo_url;
      } else {
        resolve();
      }
    } catch (error) {
      console.error('Error applying QR code styling:', error);
      reject(error);
    }
  });
};

/**
 * Generate a complete styled QR code on a canvas element
 */
export const generateStyledQRCode = async (
  canvas: HTMLCanvasElement,
  text: string,
  options: QRCodeOptions = {}
): Promise<void> => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Generate basic QR code
    await qrcode.toCanvas(canvas, text, {
      width: options.width || 300,
      margin: options.margin || 4,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      color: {
        dark: options.style?.foreground_color || '#000000',
        light: options.style?.background_color || '#FFFFFF'
      }
    });

    // Apply advanced styling if style is provided
    if (options.style) {
      await applyQRCodeStyling(canvas, options.style);
    }
  } catch (error) {
    console.error('Error generating styled QR code:', error);
    throw error;
  }
};
