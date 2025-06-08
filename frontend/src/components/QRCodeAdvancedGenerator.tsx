import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { API_URL } from 'app';

export interface QRStyleConfig {
  // Basic properties
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
  
  // Colors
  fgColor: string;
  bgColor: string;
  
  // Advanced styling
  bodyStyle: 'square' | 'circle' | 'rounded' | 'dots' | 'classy' | 'diamond';
  eyeFrameStyle: 'square' | 'circle' | 'rounded';
  eyeBallStyle: 'square' | 'circle' | 'rounded';
  
  // Corner radius (for rounded styles)
  cornerRadius: number;
  
  // Logo/Image
  logoImage?: string;
  logoSize: number;
  logoMargin: number;
}

export interface Props {
  data: string;
  initialConfig?: Partial<QRStyleConfig>;
  onQRGenerated?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

const QRCodeAdvancedGenerator: React.FC<Props> = ({
  data,
  initialConfig = {},
  onQRGenerated,
  className = ''
}) => {
  const [config, setConfig] = useState<QRStyleConfig>({
    size: 300,
    level: 'M',
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    bodyStyle: 'square',
    eyeFrameStyle: 'square',
    eyeBallStyle: 'square',
    cornerRadius: 0,
    logoSize: 20,
    logoMargin: 4,
    ...initialConfig
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate QR preview using backend API
  const generateQRPreview = useCallback(async () => {
    if (!data) return;
    
    setIsLoading(true);
    try {
      // Use backend API to generate QR preview
      const params = new URLSearchParams({
        url: encodeURIComponent(data),
        size: config.size.toString(),
        dots_style: config.bodyStyle,
        corner_style: config.eyeFrameStyle,
        foreground_color_override: config.fgColor,
        background_color_override: config.bgColor,
        error_correction: config.level
      });
      
      const imageUrl = `${API_URL}/qr-image/temp-preview.png?${params.toString()}&t=${Date.now()}`;
      setPreviewUrl(imageUrl);
      
      // If onQRGenerated callback is provided, create a canvas with the image
      if (onQRGenerated) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            onQRGenerated(canvas);
          }
        };
        img.src = imageUrl;
      }
    } catch (error) {
      console.error('Error generating QR preview:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, config, onQRGenerated]);

  // Update preview when data or config changes
  useEffect(() => {
    generateQRPreview();
  }, [generateQRPreview]);

  const handleConfigChange = (updates: Partial<QRStyleConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            QR Code Styling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Preview */}
          <div className="space-y-4">
            <Label>QR Code Preview</Label>
            <div 
              className="border rounded-lg p-4 bg-white inline-block max-w-full overflow-hidden"
              style={{ backgroundColor: config.bgColor }}
            >
              {isLoading ? (
                <div 
                  style={{
                    width: Math.min(config.size, 300),
                    height: Math.min(config.size, 300),
                    backgroundColor: config.fgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: config.bgColor,
                    border: `2px solid ${config.fgColor}`,
                    borderRadius: '4px'
                  }}
                >
                  Generating...
                </div>
              ) : previewUrl ? (
                <img 
                  src={previewUrl}
                  alt="QR Code Preview"
                  className="max-w-full h-auto"
                  style={{ maxWidth: '300px', maxHeight: '300px' }}
                  onError={(e) => {
                    console.error('Error loading QR preview image');
                  }}
                />
              ) : (
                <div 
                  style={{
                    width: Math.min(config.size, 300),
                    height: Math.min(config.size, 300),
                    backgroundColor: config.fgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: config.bgColor,
                    border: `2px solid ${config.fgColor}`,
                    borderRadius: '4px'
                  }}
                >
                  No Data
                </div>
              )}
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Basic Settings</h4>
              
              <div className="space-y-2">
                <Label htmlFor="size">Size (pixels)</Label>
                <Input
                  id="size"
                  type="number"
                  value={config.size}
                  onChange={(e) => handleConfigChange({ size: Number(e.target.value) })}
                  min={100}
                  max={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Error Correction</Label>
                <Select value={config.level} onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => handleConfigChange({ level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Style Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Style Settings</h4>
              
              <div className="space-y-2">
                <Label htmlFor="bodyStyle">Dots Style</Label>
                <Select value={config.bodyStyle} onValueChange={(value: any) => handleConfigChange({ bodyStyle: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eyeFrameStyle">Corner Frame Style</Label>
                <Select value={config.eyeFrameStyle} onValueChange={(value: any) => handleConfigChange({ eyeFrameStyle: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Colors</h4>
              
              <div className="space-y-2">
                <Label htmlFor="fgColor">Foreground Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => handleConfigChange({ fgColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={config.fgColor}
                    onChange={(e) => handleConfigChange({ fgColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => handleConfigChange({ bgColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => handleConfigChange({ bgColor: e.target.value })}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Advanced</h4>
              
              <Button 
                onClick={generateQRPreview}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Generating...' : 'Refresh Preview'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeAdvancedGenerator;
export { QRCodeAdvancedGenerator };