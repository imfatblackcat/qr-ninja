import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import brain from 'brain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Save, TestTube } from 'lucide-react';
import { QRCodeAdvancedGenerator } from 'components/QRCodeAdvancedGenerator';

export default function QRGenerationTest() {
  const [qrData, setQrData] = useState('https://example.com');
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [format, setFormat] = useState('png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  const generateAndSaveQR = async () => {
    if (!qrRef.current) return;
    
    setIsGenerating(true);
    try {
      // Generate QR code image using html2canvas
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: bgColor,
        scale: 2, // Higher resolution
        width: size,
        height: size
      });
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, `image/${format}`);
      });
      
      // Convert blob to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data:image/... prefix
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      });
      
      // Save to backend storage
      const response = await brain.save_generated_file({
        qrCodeId: 'test-frontend-generation'
      }, {
        format: format as any,
        size: size,
        file_data: base64
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        toast.success(`QR code saved successfully! File ID: ${result.file_id}`);
        // Refresh file list
        loadSavedFiles();
      } else {
        toast.error('Failed to save QR code');
      }
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const loadSavedFiles = async () => {
    try {
      const response = await brain.list_generated_files({
        qr_code_id: 'test-frontend-generation'
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setSavedFiles(result.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };
  
  const downloadFile = async (fileId: string) => {
    try {
      const response = await brain.download_generated_file({
        file_id: fileId
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code-${fileId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('File downloaded successfully!');
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };
  
  React.useEffect(() => {
    loadSavedFiles();
  }, []);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-data">QR Code Data</Label>
                <Input
                  id="qr-data"
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="Enter URL or text"
                />
              </div>
              
              <div>
                <Label htmlFor="size">Size (pixels)</Label>
                <Input
                  id="size"
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  min="128"
                  max="1024"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fg-color">Foreground Color</Label>
                  <Input
                    id="fg-color"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generateAndSaveQR} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate & Save QR Code'}
              </Button>
            </div>
            
            {/* Preview */}
            <div className="space-y-4">
              <Label>QR Code Preview</Label>
              <div ref={qrRef} className="border rounded-lg p-4 bg-white inline-block">
                {/* Simple QR preview placeholder - actual generation happens via backend API */}
                <div 
                  style={{
                    width: Math.min(size, 300),
                    height: Math.min(size, 300),
                    backgroundColor: fgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: bgColor,
                    border: `2px solid ${fgColor}`,
                    borderRadius: '4px'
                  }}
                >
                  QR Preview<br/>
                  {qrData.substring(0, 20)}...
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Saved Files */}
      <Card>
        <CardHeader>
          <CardTitle>Saved QR Codes ({savedFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {savedFiles.length === 0 ? (
            <p className="text-muted-foreground">No saved files yet. Generate one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedFiles.map((file) => (
                <Card key={file.id} className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">File ID: {file.id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      Format: {file.format.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Size: {file.size}x{file.size} px
                    </p>
                    <p className="text-sm text-muted-foreground">
                      File Size: {(file.file_size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(file.created_at * 1000).toLocaleString()}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => downloadFile(file.id)}
                    >
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}