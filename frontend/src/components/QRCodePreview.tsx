import React, { useEffect, useState } from "react";
import { generateTrackingUrl } from "utils/trackingUrl";
import { useQrCreationStore } from "utils/qrCreationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { API_URL } from "app";
import { CanvasQRCode } from "components/CanvasQRCode";

export function QRCodePreview() {
  const {
    destinationUrl,
    qrCodeId,
    storeHash,
    qrForegroundColor,
    qrBackgroundColor,
    qrDotsStyle,
    qrCornerStyle,
    qrCornerColor,
    qrLogoUrl,
    qrLogoSize,
    currentStep,
  } = useQrCreationStore((state) => ({
    destinationUrl: state.destinationUrl,
    qrForegroundColor: state.qrStyles.qrForegroundColor,
    qrBackgroundColor: state.qrStyles.qrBackgroundColor,
    qrDotsStyle: state.qrStyles.dotsStyle,
    qrCornerStyle: state.qrStyles.cornerStyle,
    qrCornerColor: state.qrStyles.useCustomCornerColor ? state.qrStyles.qrCornerColor : state.qrStyles.qrForegroundColor,
    qrLogoUrl: state.qrStyles.logoUrl,
    qrLogoSize: state.qrStyles.logoSize,
    currentStep: state.currentStep,
    qrCodeId: state.qrCodeId,
    storeHash: state.storeHash,
  }));
  
  console.log('[QRCodePreview] Current styling state:', {
    dots_style: qrDotsStyle,
    corner_style: qrCornerStyle,
    foreground_color: qrForegroundColor,
    background_color: qrBackgroundColor,
    corner_color: qrCornerColor
  });

  const previewSize = 220; // Size for the preview QR code
  const [qrImageUrl, setQrImageUrl] = useState("");

  // Determine if the actual QR code should be shown or a placeholder
  // Show actual QR only from Step 3 onwards, and if destinationUrl is set.
  const showActualQr = currentStep >= 3 && destinationUrl;

  useEffect(() => {
    if (showActualQr) {
      // Determine the base URL based on environment
      const isProduction = window.location.hostname === 'app.getrobo.xyz' || 
        window.location.hostname.includes('getrobo.xyz') || 
        !window.location.hostname.includes('localhost');
      
      // Base URL including the API path
      const baseUrl = isProduction ? 
        "https://app.getrobo.xyz/api" : 
        API_URL;

      if (qrCodeId) {
        // Use saved QR code ID
        const imageUrl = new URL(`${baseUrl}/qr-image/${qrCodeId}.png`);
        
        // Add query parameters for styling
        imageUrl.searchParams.append('size', previewSize.toString());
        imageUrl.searchParams.append('dots_style', qrDotsStyle || 'square');
        imageUrl.searchParams.append('corner_style', qrCornerStyle || 'square');
        imageUrl.searchParams.append('foreground_color_override', qrForegroundColor || '#000000');
        imageUrl.searchParams.append('background_color_override', qrBackgroundColor || '#FFFFFF');
        
        if (qrCornerColor && qrCornerColor !== qrForegroundColor) {
          imageUrl.searchParams.append('actual_corner_color', qrCornerColor);
        }
        
        console.log('[QRCodePreview] Generated image URL (saved QR):', imageUrl.toString());
        console.log('[QRCodePreview] Styling parameters (saved QR):', {
          dots_style: qrDotsStyle,
          corner_style: qrCornerStyle,
          foreground_color: qrForegroundColor,
          background_color: qrBackgroundColor,
          corner_color: qrCornerColor,
          size: previewSize
        });
        setQrImageUrl(imageUrl.toString());
      } else if (destinationUrl && destinationUrl.trim() !== "") {
        // For unsaved QR codes, create a temporary test QR code to render with server-side styling
        // This ensures consistent rendering between preview and download
        const testUrl = destinationUrl.startsWith('http') ? destinationUrl : `https://${destinationUrl}`;
        
        // Use a temporary test QR code endpoint that accepts URL as parameter
        const imageUrl = new URL(`${baseUrl}/qr-image/temp-preview.png`);
        imageUrl.searchParams.append('url', testUrl);
        imageUrl.searchParams.append('size', previewSize.toString());
        imageUrl.searchParams.append('dots_style', qrDotsStyle || 'square');
        imageUrl.searchParams.append('corner_style', qrCornerStyle || 'square');
        imageUrl.searchParams.append('foreground_color_override', qrForegroundColor || '#000000');
        imageUrl.searchParams.append('background_color_override', qrBackgroundColor || '#FFFFFF');
        
        if (qrCornerColor && qrCornerColor !== qrForegroundColor) {
          imageUrl.searchParams.append('actual_corner_color', qrCornerColor);
        }
        
        console.log('[QRCodePreview] Generated image URL (temp preview):', imageUrl.toString());
        console.log('[QRCodePreview] Preview URL:', testUrl);
        console.log('[QRCodePreview] Styling parameters (temp preview):', {
          dots_style: qrDotsStyle,
          corner_style: qrCornerStyle,
          foreground_color: qrForegroundColor,
          background_color: qrBackgroundColor,
          corner_color: qrCornerColor,
          size: previewSize
        });
        setQrImageUrl(imageUrl.toString());
      } else {
        setQrImageUrl("");
      }
    } else {
      setQrImageUrl("");
    }
  }, [showActualQr, qrCodeId, destinationUrl, qrDotsStyle, qrCornerStyle, qrForegroundColor, qrBackgroundColor, qrCornerColor, previewSize]);

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-center">QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4 min-h-[280px]">
        {showActualQr ? (
          qrImageUrl ? (
            // Always use server-side rendering for consistency
            <img 
              src={qrImageUrl} 
              alt="QR Code Preview" 
              width={previewSize} 
              height={previewSize} 
              className="max-w-full h-auto"
              onError={(e) => {
                console.error('Error loading QR image:', e);
                setQrImageUrl(""); // Reset on error to show fallback
              }}
            />
          ) : (
            <div className="text-center text-gray-500">
              <p>{qrCodeId ? "Loading QR code..." : "Enter a valid URL to see preview"}</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 p-6 bg-gray-50 rounded-md w-full h-[220px]">
            <QrCode className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-sm">
              {currentStep < 3 
                ? "Your QR code preview will appear in the next step (Step 3: Customization)."
                : "Please enter a target URL to see the preview."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
