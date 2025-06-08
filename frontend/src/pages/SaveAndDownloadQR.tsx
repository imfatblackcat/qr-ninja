import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateTrackingUrl } from "utils/trackingUrl"; // Added import
import { useQrCreationStore } from "utils/qrCreationStore";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { API_URL } from "app";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, RefreshCw, Share2 } from "lucide-react";
import { QRCodePreview } from "components/QRCodePreview"; // Added import
import { CanvasQRCode } from "components/CanvasQRCode"; // For actual download generation
import jsPDF from 'jspdf'; // Ensure jsPDF is imported

// Define types for better clarity, though not strictly enforced by JS
type QRCodeFormat = "png" | "jpeg" | "svg" | "pdf";

export default function SaveAndDownloadQRPage() {
  const navigate = useNavigate();
  const {
    qrName,
    destinationUrl,
    qrForegroundColor,
    qrBackgroundColor,
    qrDotsStyle,
    qrCornerStyle,
    qrCornerColor,
    qrLogoUrl,
    qrLogoSize,
    qrCodeId, // Added qrCodeId
    storeHash, // Added storeHash
    // qrType, // qrType is not used in this component, consider removing from destructuring if not needed elsewhere implicitly
    currentStep,
    setCurrentStep,
    resetQrCreationState, // Action to reset the store
  } = useQrCreationStore((state) => ({
    qrName: state.qrName,
    destinationUrl: state.destinationUrl,
    qrForegroundColor: state.qrStyles.qrForegroundColor,
    qrBackgroundColor: state.qrStyles.qrBackgroundColor,
    qrDotsStyle: state.qrStyles.dotsStyle,
    qrCornerStyle: state.qrStyles.cornerStyle,
    qrCornerColor: state.qrStyles.useCustomCornerColor && typeof state.qrStyles.qrCornerColor === 'string' && state.qrStyles.qrCornerColor.trim() !== '' ? state.qrStyles.qrCornerColor : state.qrStyles.qrForegroundColor,
    qrLogoUrl: state.qrStyles.logoUrl,
    qrLogoSize: state.qrStyles.logoSize,
    // qrType: state.qrType, 
    currentStep: state.currentStep,
    setCurrentStep: state.actions.setCurrentStep,
    resetQrCreationState: state.actions.resetQrCreationState,
    qrCodeId: state.qrCodeId, // Get qrCodeId from store
    storeHash: state.storeHash, // Get storeHash from store
  }));

  const [downloadFormat, setDownloadFormat] = useState<QRCodeFormat>("png");
  const [downloadSize, setDownloadSize] = useState(512); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Helper function to map current styles to advanced generator styles
  const mapStyleToAdvanced = (style: string): 'square' | 'circle' | 'rounded' | 'dots' | 'classy' | 'diamond' => {
    switch (style) {
      case 'dots': return 'dots';
      case 'rounded': return 'rounded';
      case 'diamond': return 'diamond';
      case 'classy': return 'classy';
      case 'circle': return 'circle';
      default: return 'square';
    }
  };

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (currentStep < 3 || !destinationUrl) {
      navigate("/customize-qr-visuals");
    }
  }, [currentStep, destinationUrl, navigate]);

  const handleDownload = async () => {
    if (!destinationUrl && !(qrCodeId && storeHash)) {
      toast.error("Error preparing QR code for download. Missing URL or QR ID/Store Hash.");
      return;
    }
    setIsDownloading(true);

    const urlToEncode = qrCodeId && storeHash ? generateTrackingUrl(qrCodeId, storeHash) : destinationUrl;
    if (!urlToEncode) {
      toast.error("Cannot generate QR code: No URL to encode.");
      setIsDownloading(false);
      return;
    }

    const finalFileName = `${qrName || "qr-code"}.${downloadFormat}`;
    
    try {
      // Use frontend generation with QRCodeAdvancedGenerator
      const config = {
        size: downloadSize,
        fgColor: qrForegroundColor || '#000000',
        bgColor: qrBackgroundColor || '#FFFFFF',
        bodyStyle: mapStyleToAdvanced(qrDotsStyle || 'square'),
        eyeFrameStyle: mapStyleToAdvanced(qrCornerStyle || 'square'),
        eyeBallStyle: mapStyleToAdvanced(qrCornerStyle || 'square'),
        cornerRadius: 4,
        logoImage: qrLogoUrl || undefined,
        logoSize: qrLogoSize || 0.15
      };
      
      console.log("[SaveAndDownloadQR] Generating QR with config:", config);
      setIsGenerating(true);
      
      // Generate QR code using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.width = downloadSize;
      canvas.height = downloadSize;
      
      // Use qrcode library directly to generate basic QR
      const qrcode = await import('qrcode');
      
      // Generate basic QR code first
      await qrcode.toCanvas(canvas, urlToEncode, {
        width: downloadSize,
        margin: 2,
        color: {
          dark: config.fgColor,
          light: config.bgColor
        },
        errorCorrectionLevel: 'H'
      });
      
      // Get data URL
      let finalDataUrl = canvas.toDataURL('image/png');
      
      // Convert to desired format
      if (downloadFormat === 'pdf') {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'px',
              format: [downloadSize, downloadSize],
            });
            pdf.addImage(img, 'PNG', 0, 0, downloadSize, downloadSize);
            pdf.save(finalFileName);
            resolve();
          };
          img.onerror = reject;
          img.src = finalDataUrl;
        });
      } else if (downloadFormat === 'svg') {
        // Generate SVG format
        const svgString = await qrcode.toString(urlToEncode, {
          type: 'svg',
          width: downloadSize,
          margin: 2,
          color: {
            dark: config.fgColor,
            light: config.bgColor
          },
          errorCorrectionLevel: 'H'
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        saveAs(blob, finalFileName);
      } else {
        // Convert data URL to blob and download (PNG/JPEG)
        const response = await fetch(finalDataUrl);
        const blob = await response.blob();
        
        if (downloadFormat === 'jpeg') {
          // Convert PNG to JPEG
          const jpegCanvas = document.createElement('canvas');
          const jpegCtx = jpegCanvas.getContext('2d');
          if (jpegCtx) {
            jpegCanvas.width = downloadSize;
            jpegCanvas.height = downloadSize;
            
            // Fill with white background for JPEG
            jpegCtx.fillStyle = config.bgColor;
            jpegCtx.fillRect(0, 0, downloadSize, downloadSize);
            
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => {
                jpegCtx.drawImage(img, 0, 0);
                jpegCanvas.toBlob((jpegBlob) => {
                  if (jpegBlob) {
                    saveAs(jpegBlob, finalFileName);
                  }
                  resolve();
                }, 'image/jpeg', 0.9);
              };
              img.src = finalDataUrl;
            });
          }
        } else {
          saveAs(blob, finalFileName);
        }
      }
      
      // Save to backend storage if we have a QR code ID
      if (qrCodeId) {
        try {
          const styleConfig = {
            fgColor: config.fgColor,
            bgColor: config.bgColor,
            bodyStyle: config.bodyStyle,
            eyeFrameStyle: config.eyeFrameStyle,
            eyeBallStyle: config.eyeBallStyle,
            logoImage: config.logoImage,
            logoSize: config.logoSize,
            size: downloadSize,
            format: downloadFormat
          };
          
          await brain.save_generated_file({
            qrCodeId: qrCodeId
          }, {
            format: downloadFormat as any,
            size: downloadSize,
            style_config: styleConfig,
            file_data: finalDataUrl
          });
          
          console.log('[SaveAndDownloadQR] File saved to backend storage');
        } catch (saveError) {
          console.warn('[SaveAndDownloadQR] Could not save to backend storage:', saveError);
          // Don't fail the download if storage fails
        }
      }
      
      setIsGenerating(false);
      setIsDownloading(false);
      toast.success(`QR Code downloaded as ${finalFileName}!`);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      setIsGenerating(false);
      setIsDownloading(false);
      toast.error(`Failed to generate QR code: ${error.message}`);
    }
  };

  const handleCreateAnother = () => {
    resetQrCreationState();
    setCurrentStep(1);
    navigate("/select-qr-type");
    toast.info("Ready to create a new QR code!");
  };

  const handleBack = () => {
    setCurrentStep(3);
    navigate("/customize-qr-visuals");
  };

  const shareUrl = window.location.origin + "/qr/" + (qrName ? encodeURIComponent(qrName) : "shared-code");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: qrName || "My QR Code",
        text: `Check out this QR code I created: ${qrName || "QR Code"}`,
        url: shareUrl,
      })
      .then(() => toast.success("QR Code shared!"))
      .catch((error) => toast.error(`Sharing failed: ${error}` ));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success("Shareable link copied to clipboard!"))
        .catch(() => toast.error("Could not copy link. Please copy it manually."));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />

      <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
        <div className="flex-grow lg:w-2/3">
          <Card className="w-full shadow-lg rounded-lg h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Step 4: Save & Download Your QR Code</CardTitle>
              <CardDescription>
                Your QR code is ready! Choose your preferred format and size for download.
              </CardDescription>
              {qrName && <p className="mt-2 text-lg font-medium text-primary">Name: {qrName}</p>}
              {destinationUrl && <p className="text-sm text-muted-foreground break-all">URL: {destinationUrl}</p>}
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* QR Code Preview */}
              <div className="flex justify-center mb-6">
                <div className="border rounded-lg p-4 bg-white">
                  {destinationUrl ? (
                    <QRCodePreview
                      value={qrCodeId && storeHash ? generateTrackingUrl(qrCodeId, storeHash) : destinationUrl}
                      size={200}
                      fgColor={qrForegroundColor}
                      bgColor={qrBackgroundColor}
                      logoUrl={qrLogoUrl}
                      logoSize={qrLogoSize}
                      dotsStyle={qrDotsStyle}
                      cornerStyle={qrCornerStyle}
                      cornerColor={qrCornerColor}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-500">QR Preview</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="download-format">Download Format</Label>
                  <Select
                    value={downloadFormat}
                    onValueChange={(value) => setDownloadFormat(value as QRCodeFormat)}
                  >
                    <SelectTrigger id="download-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="download-size-select">Download Size</Label>
                <Select
                  value={String(downloadSize)}
                  onValueChange={(value) => setDownloadSize(parseInt(value, 10))}
                >
                  <SelectTrigger id="download-size-select" className="w-full">
                    <SelectValue placeholder="Select download size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: "512x512", value: 512 },
                      { label: "1024x1024", value: 1024 },
                      { label: "2048x2048", value: 2048 },
                      { label: "4096x4096", value: 4096 },
                    ].map((option) => (
                      <SelectItem key={option.label} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>

              <Button
                onClick={handleDownload}
                disabled={isDownloading || !destinationUrl}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 text-base"
              >
                <Download className="mr-2 h-5 w-5" />
                {isDownloading ? "Downloading..." : `Download ${downloadFormat.toUpperCase()}`}
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t">
                <Button onClick={handleCreateAnother} variant="outline" className="w-full sm:w-auto flex-grow">
                    <RefreshCw className="mr-2 h-4 w-4" /> Create Another QR Code
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full sm:w-auto flex-grow">
                    <Share2 className="mr-2 h-4 w-4" /> Share QR Code
                </Button>
              </div>

            </CardContent>
            <CardFooter className="flex justify-start pt-6 border-t">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back (Step 3: Customize)
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:w-1/3 lg:max-w-sm mt-8 lg:mt-0 h-full">
          <QRCodePreview />
        </div>
      </div>
    </div>
  );
}
