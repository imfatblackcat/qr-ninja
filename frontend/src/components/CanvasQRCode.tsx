import React, { useEffect, useRef } from 'react';
import qrcode from 'qrcode';

interface QRCodeStyle {
  foreground_color: string;
  background_color: string;
  dots_style: string;
  corner_style: string;
  corner_color?: string; // Optional color for corners
  logo_url?: string;
  logo_size: number;
}

interface Props {
  value: string;
  size: number;
  level?: string;
  includeMargin?: boolean;
  style?: QRCodeStyle;
}

const CanvasQRCode: React.FC<Props> = ({
  value,
  size = 200,
  level = 'H',
  includeMargin = true,
  style = {
    foreground_color: '#000000',
    background_color: '#FFFFFF',
    dots_style: 'square',
    corner_style: 'square',
    corner_color: '#000000', // Default corner color same as dot color
    logo_size: 0
  }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const errorCorrectionLevels: Record<string, any> = {
    L: 'L', // 7% of data can be restored
    M: 'M', // 15% of data can be restored
    Q: 'Q', // 25% of data can be restored
    H: 'H'  // 30% of data can be restored
  };

  const generateQR = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear existing content to background color first
    ctx.fillStyle = style.background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!value || value.trim() === "" || value.trim().toLowerCase() === "http://" || value.trim().toLowerCase() === "https://") {
      ctx.font = '14px Arial';
      ctx.fillStyle = style.foreground_color; // Use foreground for text, assuming background is light
      ctx.textAlign = 'center';
      ctx.fillText('Provide a valid URL', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText('to generate QR code.', canvas.width / 2, canvas.height / 2 + 10);
      return;
    }

    const options = {
      errorCorrectionLevel: errorCorrectionLevels[level] || 'H',
      margin: includeMargin ? 4 : 0,
      color: {
        dark: style.foreground_color,
        light: style.background_color
      },
      width: size,
      height: size
    };

    try {
      // Generate QR code on canvas
      // Ensure canvas is cleared to background before attempting to draw QR with potentially problematic value
      // This initial clear was moved up before the value check.
      // ctx.clearRect(0, 0, canvas.width, canvas.height); 
      
      await qrcode.toCanvas(canvas, value, options);

      // Get raw QR code data for custom styling
      const qrData = qrcode.create(value, {
        errorCorrectionLevel: errorCorrectionLevels[level] || 'H'
      });
      
      // Apply custom styling for dots and corners
      if (style.dots_style !== 'square' || style.corner_style !== 'square' || style.corner_color) {
        // Get the QR code modules (dots)
        const modules = qrData.modules;
        if (!modules) return;

        const moduleCount = modules.size;
        const moduleSize = size / (moduleCount + (includeMargin ? 8 : 0));
        const offset = includeMargin ? moduleSize * 4 : 0;
        
        // Clear canvas and set background
        ctx.fillStyle = style.background_color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code with custom styling
        ctx.fillStyle = style.foreground_color;
        
        // First pass: draw all non-corner modules with dot style
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            // Skip drawing position detection patterns (corners)
            if (
              // Top-left corner
              (row < 7 && col < 7) ||
              // Top-right corner
              (row < 7 && col >= moduleCount - 7) ||
              // Bottom-left corner
              (row >= moduleCount - 7 && col < 7)
            ) {
              continue;
            }
            
            if (modules.get(row, col)) {
              const x = Math.round(col * moduleSize + offset);
              const y = Math.round(row * moduleSize + offset);
              const width = Math.ceil(moduleSize);
              const height = Math.ceil(moduleSize);
              
              switch (style.dots_style) {
                case 'rounded':
                  // Draw rounded dots
                  const radius = moduleSize / 2;
                  ctx.beginPath();
                  ctx.moveTo(x + radius, y);
                  ctx.arcTo(x + width, y, x + width, y + height, radius);
                  ctx.arcTo(x + width, y + height, x, y + height, radius);
                  ctx.arcTo(x, y + height, x, y, radius);
                  ctx.arcTo(x, y, x + width, y, radius);
                  ctx.closePath();
                  ctx.fill();
                  break;
                  
                case 'dots':
                  // Draw circular dots
                  ctx.beginPath();
                  ctx.arc(
                    x + moduleSize / 2,
                    y + moduleSize / 2,
                    moduleSize / 2 * 0.85, // Slightly smaller than full size
                    0,
                    2 * Math.PI
                  );
                  ctx.fill();
                  break;
                  
                case 'honeycomb':
                  // Draw hexagon (honeycomb) shapes
                  const centerX = x + moduleSize / 2;
                  const centerY = y + moduleSize / 2;
                  const hexSize = moduleSize / 2 * 0.95; // Slightly smaller than full size
                  
                  ctx.beginPath();
                  // Draw hexagon (6 points)
                  for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const hx = centerX + hexSize * Math.cos(angle);
                    const hy = centerY + hexSize * Math.sin(angle);
                    if (i === 0) {
                      ctx.moveTo(hx, hy);
                    } else {
                      ctx.lineTo(hx, hy);
                    }
                  }
                  ctx.closePath();
                  ctx.fill();
                  break;
                  
                case 'classy':
                  // Draw diamond shapes
                  ctx.beginPath();
                  ctx.moveTo(x + moduleSize / 2, y);
                  ctx.lineTo(x + moduleSize, y + moduleSize / 2);
                  ctx.lineTo(x + moduleSize / 2, y + moduleSize);
                  ctx.lineTo(x, y + moduleSize / 2);
                  ctx.closePath();
                  ctx.fill();
                  break;
                  
                default: // 'square'
                  // Draw squares (default)
                  ctx.fillRect(x, y, width, height);
                  break;
              }
            }
          }
        }
        
        // Second pass: draw corner patterns with custom style
        const drawCornerPattern = (startRow: number, startCol: number) => {
          // Outer border - 7x7
          ctx.fillStyle = style.corner_color || style.foreground_color; // Use corner color if available
          
          const drawCorner = (r: number, c: number, size: number) => {
            const x = Math.round(c * moduleSize + offset);
            const y = Math.round(r * moduleSize + offset);
            const width = Math.ceil(moduleSize * size);
            const height = Math.ceil(moduleSize * size);
            
            switch (style.corner_style) {
              case 'rounded':
                // Rounded corner
                const radius = moduleSize * size / 4;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.arcTo(x + width, y, x + width, y + height, radius);
                ctx.arcTo(x + width, y + height, x, y + height, radius);
                ctx.arcTo(x, y + height, x, y, radius);
                ctx.arcTo(x, y, x + width, y, radius);
                ctx.closePath();
                ctx.fill();
                break;
                
              case 'dots':
                // For dots style, draw circles for corner patterns
                ctx.beginPath();
                ctx.arc(
                  x + width / 2,
                  y + height / 2,
                  Math.min(width, height) / 2, // Use full circle size for corners
                  0,
                  2 * Math.PI
                );
                ctx.fill();
                break;
                
              case 'classy':
                // Use more traditional shape for corners
                ctx.beginPath();
                ctx.moveTo(x + width / 4, y);
                ctx.lineTo(x + width - width / 4, y);
                ctx.lineTo(x + width, y + height / 4);
                ctx.lineTo(x + width, y + height - height / 4);
                ctx.lineTo(x + width - width / 4, y + height);
                ctx.lineTo(x + width / 4, y + height);
                ctx.lineTo(x, y + height - height / 4);
                ctx.lineTo(x, y + height / 4);
                ctx.closePath();
                ctx.fill();
                break;
                
              default: // 'square'
                // Standard square
                ctx.fillRect(x, y, width, height);
                break;
            }
          };
          
          // Outer box (7x7)
          drawCorner(startRow, startCol, 7);
          
          // Inner bg (5x5)
          ctx.fillStyle = style.background_color;
          drawCorner(startRow + 1, startCol + 1, 5);
          
          // Inner box (3x3)
          ctx.fillStyle = style.foreground_color;
          drawCorner(startRow + 2, startCol + 2, 3);
        };
        
        // Draw the three corner patterns
        drawCornerPattern(0, 0); // Top-left
        drawCornerPattern(0, moduleCount - 7); // Top-right
        drawCornerPattern(moduleCount - 7, 0); // Bottom-left
      }

      // Add logo if provided
      if (style.logo_url && style.logo_size > 0) {
        const logoSize = style.logo_size * (size / 10); // Convert from 1-10 scale
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        const logo = new Image();
        logo.onload = () => {
          // Draw white background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        };
        logo.src = style.logo_url;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Explicitly clear canvas before drawing error message
      if (ctx && canvasRef.current) {
        // Use background_color from style, or default to white if not available
        const bgColor = style && style.background_color ? style.background_color : '#FFFFFF';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      // Draw error message
      if (ctx) { // Check ctx again before drawing text
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FF0000'; // Red
        ctx.textAlign = 'center'; // Center the text
        ctx.fillText('Error generating QR code', canvasRef.current ? canvasRef.current.width / 2 : 10, canvasRef.current ? canvasRef.current.height / 2 : size / 2);
      }
    }
  };

  useEffect(() => {
    generateQR();
  }, [value, size, level, includeMargin, style]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export { CanvasQRCode };
