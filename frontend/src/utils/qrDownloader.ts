import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { API_URL } from './api';

/**
 * Utility functions to download QR codes in different formats
 */

// Create and download QR code as SVG
export const downloadQRAsSVG = (element: HTMLElement, filename: string): void => {
  if (!element) return;
  
  // Check if element contains SVG or Canvas
  const svgElement = element.querySelector('svg');
  const canvasElement = element.querySelector('canvas');
  
  if (svgElement) {
    // Handle SVG element
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    saveAs(blob, `${filename}.svg`);
  } else if (canvasElement) {
    // For Canvas, we'll create an SVG representation
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    
    // Set dimensions
    svg.setAttribute("width", canvasElement.width.toString());
    svg.setAttribute("height", canvasElement.height.toString());
    
    // Add a background rect
    const rect = document.createElementNS(svgNamespace, "rect");
    rect.setAttribute("width", canvasElement.width.toString());
    rect.setAttribute("height", canvasElement.height.toString());
    rect.setAttribute("fill", "white");
    svg.appendChild(rect);
    
    // Add the canvas content as an image
    const img = document.createElementNS(svgNamespace, "image");
    img.setAttribute("width", canvasElement.width.toString());
    img.setAttribute("height", canvasElement.height.toString());
    img.setAttribute("href", canvasElement.toDataURL("image/png"));
    svg.appendChild(img);
    
    // Serialize and save
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    saveAs(blob, `${filename}.svg`);
  } else {
    throw new Error('Neither SVG nor Canvas element found in QR code container');
  }
};

// Create and download QR code as PNG
export const downloadQRAsPNG = async (qrElement: HTMLElement, filename: string): Promise<void> => {
  if (!qrElement) return;
  
  try {
    // Check if we have a canvas element directly
    const canvasElement = qrElement.querySelector('canvas');
    
    if (canvasElement) {
      // Direct export from canvas
      canvasElement.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${filename}.png`);
        } else {
          throw new Error('Failed to create PNG blob from canvas');
        }
      }, 'image/png');
      return;
    }
    
    // Try SVG as fallback
    const svgElement = qrElement.querySelector('svg');
    if (svgElement) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas size (3x for better quality)
      const size = 600;
      canvas.width = size;
      canvas.height = size;
      
      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      
      // Convert SVG to an image
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      // Create a Blob from the SVG
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(svgBlob);
      
      // Wait for image to load, then draw to canvas and create PNG
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Draw image centered on canvas
          const padding = 40;
          ctx.drawImage(img, padding, padding, size - (padding * 2), size - (padding * 2));
          
          // Convert to PNG and save
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `${filename}.png`);
              resolve();
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
            URL.revokeObjectURL(url);
          }, 'image/png');
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG as image'));
        };
        
        img.src = url;
      });
    } else {
      // If neither canvas nor SVG is found, use html2canvas as last resort
      const canvas = await html2canvas(qrElement, {
        backgroundColor: '#FFFFFF',
        scale: 3 // Higher quality
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${filename}.png`);
        } else {
          throw new Error('Failed to create PNG blob from html2canvas');
        }
      }, 'image/png');
    }
  } catch (error) {
    console.error('Error converting QR code to PNG:', error);
    throw error;
  }
};

// Create and download QR code as PDF
export const downloadQRAsPDF = async (qrElement: HTMLElement, filename: string): Promise<void> => {
  if (!qrElement) return;
  
  try {
    let imgData: string;
    
    // Check if we have a canvas element directly
    const canvasElement = qrElement.querySelector('canvas');
    
    if (canvasElement) {
      // Get image data directly from canvas
      imgData = canvasElement.toDataURL('image/png');
    } else {
      // Try SVG as fallback
      const svgElement = qrElement.querySelector('svg');
      
      if (svgElement) {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        // Set canvas size
        const size = 800;
        canvas.width = size;
        canvas.height = size;
        
        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // Convert SVG to an image
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        
        // Create a Blob from the SVG
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        // Wait for image to load, then draw to canvas
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Draw image centered on canvas
            const padding = 50;
            ctx.drawImage(img, padding, padding, size - (padding * 2), size - (padding * 2));
            URL.revokeObjectURL(url);
            resolve();
          };
          
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load SVG as image'));
          };
          
          img.src = url;
        });
        
        // Get image data for PDF
        imgData = canvas.toDataURL('image/png');
      } else {
        // If neither canvas nor SVG is found, use html2canvas as last resort
        const canvas = await html2canvas(qrElement, {
          backgroundColor: '#FFFFFF',
          scale: 3 // Higher quality
        });
        
        imgData = canvas.toDataURL('image/png');
      }
    }
    
    // Create PDF with appropriate dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate positions to center the QR code
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = 100; // Width in mm
    const imgHeight = 100; // Height in mm
    const x = (pdfWidth - imgWidth) / 2;
    const y = 30; // Top margin
    
    // Add the QR code image
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(filename, pdfWidth / 2, y + imgHeight + 15, { align: 'center' });
    
    // Add footer with date
    pdf.setFontSize(10);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error converting QR code to PDF:', error);
    throw error;
  }
};

// Generate a QR Code in the specified format
/**
 * Downloads a QR code image directly from the API
 * @param qrCodeId - The ID of the QR code
 * @param qrName - The name of the QR code (used for filename)
 * @param format - The format to download (svg, png, pdf)
 */
export const downloadQrImage = async (qrCodeId: string, qrName: string, format: 'svg' | 'png' | 'pdf') => {
  try {
    // Detect environment for correct URL format
    const isProduction = window.location.hostname === 'app.getrobo.xyz' || 
      window.location.hostname.includes('getrobo.xyz') || 
      !window.location.hostname.includes('localhost');
      
    // In production, use the direct /api prefix for image URLs
    const baseUrl = isProduction
      ? `https://app.getrobo.xyz/api/qr-image/${qrCodeId}`
      : `${API_URL}/qr-image/${qrCodeId}`;
    
    const sanitizedFilename = qrName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // If format is PDF, we need to generate it client-side since backend doesn't support PDF directly
    if (format === 'pdf') {
      console.log(`Generating PDF for QR code: ${qrCodeId}`);
      
      // First fetch the PNG image
      const imgUrl = `${baseUrl}.png?size=600`;
      console.log(`Fetching PNG from: ${imgUrl}`);
      
      const response = await fetch(imgUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch QR code image: ${response.status} ${response.statusText}`);
      }
      
      const imgBlob = await response.blob();
      const objectUrl = URL.createObjectURL(imgBlob);
      
      // Create an image element
      const img = new Image();
      img.src = objectUrl;
      
      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate positions to center the QR code
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = 100; // Width in mm
      const imgHeight = 100; // Height in mm
      const x = (pdfWidth - imgWidth) / 2;
      const y = 20; // Top margin
      
      // Add the QR code image
      pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(qrName, pdfWidth / 2, y + imgHeight + 10, { align: 'center' });
      
      // Add footer with date
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(`${sanitizedFilename}.pdf`);
      
      // Clean up
      URL.revokeObjectURL(objectUrl);
      console.log(`Generated PDF for QR code: ${qrCodeId}`);
    } else {
      // For PNG and SVG, download directly from API
      const downloadUrl = `${baseUrl}.${format}`;
      console.log(`Downloading QR code from URL: ${downloadUrl}`);
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download QR code: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      saveAs(blob, `${sanitizedFilename}.${format}`);
      console.log(`Downloaded QR code as ${format} with filename: ${sanitizedFilename}`);
    }
  } catch (error) {
    console.error(`Error downloading QR code as ${format}:`, error);
    throw error;
  }
};

/**
 * Downloads a QR code by rendering it client-side (for QR codes without an ID)
 * This is a fallback for QR codes that haven't been saved yet
 * @param element - The HTML element containing the QR code
 * @param filename - The filename to use
 * @param format - The format to download (svg, png, pdf)
 */
export const downloadQRCode = async (
  element: HTMLElement | null, 
  filename: string,
  format: 'svg' | 'png' | 'pdf'
): Promise<void> => {
  if (!element) {
    throw new Error('QR code element not found');
  }
  
  // Check if element contains either SVG or Canvas
  const svgElement = element.querySelector('svg');
  const canvasElement = element.querySelector('canvas');
  
  if (!svgElement && !canvasElement) {
    throw new Error('Neither SVG nor Canvas element found in the QR code container');
  }
  
  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  console.log(`Downloading QR code as ${format} with filename: ${sanitizedFilename}`);
  
  try {
    switch (format) {
      case 'svg':
        downloadQRAsSVG(element, sanitizedFilename);
        break;
        
      case 'png':
        await downloadQRAsPNG(element, sanitizedFilename);
        break;
        
      case 'pdf':
        await downloadQRAsPDF(element, sanitizedFilename);
        break;
        
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error(`Error downloading QR code as ${format}:`, error);
    throw error;
  }
};
