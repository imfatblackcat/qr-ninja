import React, { useState, useEffect, useRef } from "react";
import { Layout } from "components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CanvasQRCode } from "components/CanvasQRCode";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Download, Grid, Hexagon, Palette } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { downloadQrImage } from "utils/qrDownloader";
import { Switch } from "@/components/ui/switch";
import { getStoreHash } from "utils/storeContext";
import { generateTrackingUrl } from "utils/trackingUrl";
import { deleteQrCode } from "utils/brainProxy";

// QR code style interface
interface QRCodeStyle {
  foreground_color: string;
  background_color: string;
  dots_style: string;
  corner_style: string;
  corner_color?: string;
  logo_url?: string;
  logo_size: number;
}

// QR code interface
interface QRCode {
  id: string;
  name: string;
  type: string;
  target: {
    url: string;
    product_id?: number;
    category_id?: number;
    add_to_cart?: boolean;
  };
  style: QRCodeStyle;
  active: boolean;
  created_at: number;
  updated_at: number;
  scan_count: number;
}

export default function EditQr() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [qrColor, setQrColor] = useState("#000000");
  const [cornerColor, setCornerColor] = useState("#000000");
  const [useCustomCornerColor, setUseCustomCornerColor] = useState(false);
  const [dotStyle, setDotStyle] = useState("square");
  const [cornerStyle, setCornerStyle] = useState("square");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Color options for QR code
  const colorOptions = [
    { label: "Black", value: "#000000" },
    { label: "Blue", value: "#0000FF" },
    { label: "Red", value: "#FF0000" },
    { label: "Green", value: "#008000" },
    { label: "Purple", value: "#800080" },
  ];
  
  // Predefined dot style options
  const dotStyleOptions = [
    { value: "square", label: "Square" },
    { value: "rounded", label: "Rounded" },
    { value: "dots", label: "Circles" },
    { value: "honeycomb", label: "Honeycomb" },
    { value: "classy", label: "Diamond" }
  ];
  
  // Predefined corner style options
  const cornerStyleOptions = [
    { value: "square", label: "Square" },
    { value: "rounded", label: "Rounded" },
    { value: "dots", label: "Dots" },
    { value: "classy", label: "Classy" }
  ];

  // Fetch QR code details
  useEffect(() => {
    const fetchQrCode = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Get all QR codes for the store and find the one with matching ID
        const storeHash = getStoreHash();
        
        if (!storeHash) {
          toast.error("No store context found. Please reconnect your store.");
          console.error("No store_hash available in localStorage");
          navigate("/hello-world");
          return;
        }
        const response = await brain.list_qr_codes({ storeHash });
        const data = await response.json();
        
        if (data && data.qr_codes) {
          // Find the QR code with the matching ID
          const allQrCodes = data.qr_codes;
          const fullQrCodeData = allQrCodes.find((qr: any) => qr.id === id);
          
          if (fullQrCodeData) {
            // Get detailed QR code data
            const detailsResponse = await brain.get_qr_code({ qrCodeId: id });
            const detailsData = await detailsResponse.json();
            
            if (detailsData && detailsData.qr_code) {
              setQrCode(detailsData.qr_code);
              setName(detailsData.qr_code.name);
              setActive(detailsData.qr_code.active);
              setQrColor(detailsData.qr_code.style.foreground_color);
              setDotStyle(detailsData.qr_code.style.dots_style || "square");
              setCornerStyle(detailsData.qr_code.style.corner_style || "square");
              
              // Obsługa koloru narożników
              if (detailsData.qr_code.style.corner_color && 
                  detailsData.qr_code.style.corner_color !== detailsData.qr_code.style.foreground_color) {
                setCornerColor(detailsData.qr_code.style.corner_color);
                setUseCustomCornerColor(true);
              } else {
                setCornerColor(detailsData.qr_code.style.foreground_color);
                setUseCustomCornerColor(false);
              }
            } else {
              // Fallback to basic data if detailed data is not available
              setQrCode(fullQrCodeData);
              setName(fullQrCodeData.name);
              setActive(fullQrCodeData.active);
            }
          } else {
            toast.error("QR code not found");
            navigate("/my-qr-codes");
          }
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
        toast.error("Failed to load QR code details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQrCode();
  }, [id, navigate]);

  // Handle save changes
  const handleSave = async () => {
    if (!qrCode || !id) return;
    
    setSaving(true);
    try {
      const updateData = {
        name: name,
        active: active,
        style: {
          ...qrCode.style,
          foreground_color: qrColor,
          dots_style: dotStyle,
          corner_style: cornerStyle,
          corner_color: useCustomCornerColor ? cornerColor : qrColor
        }
      };
      
      await brain.update_qr_code({ qrCodeId: id }, updateData);
      toast.success("QR code updated successfully");
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast.error("Failed to update QR code");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!qrCode || !id) return;
    
    if (confirm("Are you sure you want to delete this QR code?")) {
      try {
        // Use deleteQrCode proxy function which ensures proper functionality across environments
        const response = await deleteQrCode({ qrCodeId: id, hard_delete: true });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete QR code');
        }
        toast.success("QR code deleted");
        navigate("/my-qr-codes");
      } catch (error) {
        console.error("Error deleting QR code:", error);
        toast.error(typeof error === 'object' && error !== null ? (error as Error).message : "Failed to delete QR code");
      }
    }
  };

  // Handle download QR code
  const handleDownload = async (format: 'svg' | 'png' | 'pdf') => {
    if (!qrCode || !id) return;
    
    try {
      // Ensure we have a properly formatted name
      const filename = name.replace(/\s+/g, '_');
      await downloadQrImage(id, filename, format);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error downloading QR code as ${format}:`, error);
      toast.error(`Failed to download QR code as ${format}`);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Render if QR code not found
  if (!qrCode) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <h1 className="text-2xl font-bold">QR Code Not Found</h1>
          <p className="text-muted-foreground">The QR code you're looking for doesn't exist or was deleted.</p>
          <Button onClick={() => navigate("/my-qr-codes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My QR Codes
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate("/my-qr-codes")} className="mr-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Edit QR Code</h1>
          </div>
          <p className="text-muted-foreground ml-6">Update your QR code settings and appearance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Details</CardTitle>
              <CardDescription>
                Update the settings for your QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">QR Code Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">A name to help you identify this QR code</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="type">QR Code Type</Label>
                <Input 
                  id="type" 
                  value={qrCode.type.charAt(0).toUpperCase() + qrCode.type.slice(1)}
                  disabled
                />
                <p className="text-sm text-muted-foreground">The type of content this QR code links to</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">Destination URL</Label>
                <Input 
                  id="url" 
                  value={qrCode.target.url}
                  disabled
                />
                <p className="text-sm text-muted-foreground">Where this QR code directs users</p>
              </div>
              
              {/* Hidden field to ensure we always use standardized tracking URL */}
              <div className="hidden">
                {(() => {
                  // Update tracking URL to ensure consistency across environments
                  if (qrCode && qrCode.id) {
                    const storeHash = getStoreHash();
                    qrCode.target.url = generateTrackingUrl(qrCode.id, storeHash);
                  }
                  return null;
                })()}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="qr-color">QR Code Color</Label>
                <Select
                  value={qrColor}
                  onValueChange={setQrColor}
                >
                  <SelectTrigger id="qr-color" className="w-full">
                    <Palette className="mr-2 h-4 w-4 opacity-50" />
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose a color for your QR code</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dots-style">Dots Style</Label>
                <Select
                  value={dotStyle}
                  onValueChange={setDotStyle}
                >
                  <SelectTrigger id="dots-style" className="w-full">
                    <Grid className="mr-2 h-4 w-4 opacity-50" />
                    <SelectValue placeholder="Select dots style" />
                  </SelectTrigger>
                  <SelectContent>
                    {dotStyleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose how the dots in your QR code look</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="corner-style">Corner Style</Label>
                <Select
                  value={cornerStyle}
                  onValueChange={setCornerStyle}
                >
                  <SelectTrigger id="corner-style" className="w-full">
                    <Hexagon className="mr-2 h-4 w-4 opacity-50" />
                    <SelectValue placeholder="Select corner style" />
                  </SelectTrigger>
                  <SelectContent>
                    {cornerStyleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose how the corners in your QR code look</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="corner-color">Custom Corner Color</Label>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="use-custom-corner" 
                      className="mr-2" 
                      checked={useCustomCornerColor} 
                      onChange={(e) => setUseCustomCornerColor(e.target.checked)}
                    />
                    <label htmlFor="use-custom-corner" className="text-sm">Use custom color</label>
                  </div>
                </div>
                
                <Select
                  value={cornerColor}
                  onValueChange={setCornerColor}
                  disabled={!useCustomCornerColor}
                >
                  <SelectTrigger id="corner-color" className="w-full">
                    <Palette className="mr-2 h-4 w-4 opacity-50" />
                    <SelectValue placeholder="Select corner color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose a custom color for corners (if different from dots)</p>
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <Switch 
                  id="active" 
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">Active</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  {active ? "QR code is active and can be scanned" : "QR code is inactive and won't redirect when scanned"}
                </p>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  Created on {new Date(qrCode.created_at * 1000).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Total scans: {qrCode.scan_count.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your QR code will look.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="bg-white p-6 rounded-md shadow-sm mb-4" ref={qrCodeRef}>
                <CanvasQRCode 
                  value={qrCode.target.url} 
                  size={200} 
                  level="M" // Medium error correction capability (15%) 
                  includeMargin={true}
                  style={{
                    foreground_color: qrColor,
                    background_color: "#FFFFFF",
                    dots_style: dotStyle,
                    corner_style: cornerStyle,
                    corner_color: useCustomCornerColor ? cornerColor : qrColor,
                    logo_url: qrCode.style?.logo_url,
                    logo_size: qrCode.style?.logo_size || 0
                  }}
                />
              </div>
              
              <div className="w-full text-center space-y-1">
                <p className="text-sm break-all">
                  <span className="font-medium">URL: </span>{qrCode.target.url}
                </p>
                {qrCode.target.product_id && (
                  <p className="text-sm">
                    <span className="font-medium">Product ID: </span>{qrCode.target.product_id}
                  </p>
                )}
                {qrCode.target.category_id && (
                  <p className="text-sm">
                    <span className="font-medium">Category ID: </span>{qrCode.target.category_id}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleDownload('svg')}>
                  <Download className="mr-2 h-4 w-4" />
                  SVG
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload('png')}>
                  <Download className="mr-2 h-4 w-4" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
