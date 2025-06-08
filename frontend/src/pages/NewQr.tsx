import React, { useState, useEffect, useRef } from "react";
import { ProductSearch, Product as ProductType } from "components/ProductSearch";
import { Layout } from "components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CanvasQRCode } from "components/CanvasQRCode";
import { ExternalLink, QrCode, Download, Check, AlertCircle, Palette, ShoppingCart, Save, Plus, Grid, Hexagon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import brain from "brain";
import { API_URL } from "../utils/api";
import { generateTrackingUrl } from "../utils/trackingUrl";
import { useNavigate } from "react-router-dom";
import { downloadQrImage } from "utils/qrDownloader";
import { getStoreHash } from "utils/storeContext";
import { useQrCreationStore } from "utils/qrCreationStore"; // Added import

// QR code interface
interface QrCodeData {
  id: string;
  name: string;
  type: string;
  url: string;
  target: {
    url: string;
    product_id?: number;
    category_id?: number;
    add_to_cart?: boolean;
  };
  style: {
    foreground_color: string;
    background_color: string;
    dots_style: string;
    corner_style: string;
    corner_color?: string;
    logo_url?: string;
    logo_size: number;
  };
  active: boolean;
  created_at: number;
  scan_count: number;
}

export default function NewQr() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("Untitled QR Code");
  const [activeTab, setActiveTab] = useState("url");
  const [urlError, setUrlError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<{ qr_code: QrCodeData } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrColor, setQrColor] = useState("#000000");
  const [cornerColor, setCornerColor] = useState("#000000");
  const [useCustomCornerColor, setUseCustomCornerColor] = useState(false);
  const [dotStyle, setDotStyle] = useState("square");
  const [cornerStyle, setCornerStyle] = useState("square");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isGeneratingTestQR, setIsGeneratingTestQR] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedQrCodeId, setSavedQrCodeId] = useState<string | null>(null);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { actions: qrCreationActions } = useQrCreationStore(); // Get actions from store
  
  // Usunięto duplikację stanów dla wyboru sklepu - korzystamy z localStorage
  
  // Generate initial test QR code on component mount
  useEffect(() => {
    // Natychmiastowy podgląd QR kodu
    generateQrPreview();
  }, []);
  
  // Generate initial preview with a default URL
  const generateQrPreview = async () => {
    setIsGeneratingTestQR(true);
    try {
      // Prepare the target URL - use the entered URL if available or a placeholder
      const targetUrl = encodeURIComponent(url || "https://yourdomain.com");
      console.log("[QR Preview] Generating preview with target URL:", url || "https://yourdomain.com");
      
      // Call the API to create a test QR code for preview with our target URL
      const response = await fetch(`${API_URL}/qr-code/create-test-qr-code?url=${targetUrl}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log("[QR Preview] Test QR code created with ID:", data.qr_code_id);
      
      if (data && data.qr_code_id) {
        // Get store hash for generating tracking URL
        const storeHash = getStoreHash();
        // Generate standardized tracking URL
        const trackingUrl = generateTrackingUrl(data.qr_code_id, storeHash);
        console.log("[QR Preview] Generated standardized tracking URL:", trackingUrl);
        
        // Create a default QR code for preview
        const defaultQrCode = {
          qr_code: {
            id: data.qr_code_id,
            name: "Demo QR Code",
            type: "custom",
            url: trackingUrl,
            target: {
              url: url || trackingUrl, // Using actual URL if available, otherwise tracking URL
              displayUrl: url || "https://yourdomain.com" // Use actual URL for display too
            },
            style: {
              foreground_color: qrColor,
              background_color: "#FFFFFF",
              dots_style: dotStyle,
              corner_style: cornerStyle,
              corner_color: useCustomCornerColor ? cornerColor : qrColor,
              logo_size: 0
            },
            active: true,
            created_at: Math.floor(Date.now() / 1000),
            scan_count: 0
          }
        };
        
        // Set the preview QR code and show it
        setPreviewQRCode(defaultQrCode);
        setShowPreview(true);
        console.log("Default QR code generated successfully", defaultQrCode);
      } else {
        console.error("Failed to get valid QR code data", data);
        toast.error("Could not generate preview QR code");
      }
    } catch (error) {
      console.error("Error generating preview QR code:", error);
      toast.error("Error generating preview QR code");
    } finally {
      setIsGeneratingTestQR(false);
    }
  };
  
  // Update QR code when style properties change
  useEffect(() => {
    if (previewQRCode) {
      const updatedQrCode = { ...previewQRCode };
      updatedQrCode.qr_code.style.foreground_color = qrColor;
      updatedQrCode.qr_code.style.dots_style = dotStyle;
      updatedQrCode.qr_code.style.corner_style = cornerStyle;
      updatedQrCode.qr_code.style.corner_color = useCustomCornerColor ? cornerColor : qrColor;
      setPreviewQRCode(updatedQrCode);
      setHasUnsavedChanges(true);
    }
  }, [qrColor, cornerColor, useCustomCornerColor, dotStyle, cornerStyle]);
  useEffect(() => {
    if (previewQRCode && showPreview) {
      // Create a new temporary QR code with updated styles
      const updatedQrCode = {
        ...previewQRCode,
        qr_code: {
          ...previewQRCode.qr_code,
          style: {
            ...previewQRCode.qr_code.style,
            foreground_color: qrColor,
            dots_style: dotStyle,
            corner_style: cornerStyle
          }
        }
      };
      setPreviewQRCode(updatedQrCode);
      setHasUnsavedChanges(true);
    }
  }, [qrColor, dotStyle, cornerStyle]);
  
  // Track unsaved changes when URL or name changes
  useEffect(() => {
    if (savedQrCodeId) {
      setHasUnsavedChanges(true);
    }
  }, [url, name]);

  // Funkcja do generowania testowego kodu QR dla podglądu
  const generateTestQrCode = async () => {
    // Generujemy kod QR i ustawiamy flagę zmian
    await generateQrPreview();
    setHasUnsavedChanges(true);
    return;
  };

  // Predefined color options for Twitter-like picker
  const colorOptions = [
    "#FF6900", "#FCB900", "#7BDCB5", "#00D084", "#8ED1FC", "#0693E3", "#ABB8C3",
    "#EB144C", "#F78DA7", "#9900EF"
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

  // Validate URL format
  const validateUrl = (input: string) => {
    if (!input) {
      setUrlError("URL is required");
      return false;
    }

    // Simple URL validation
    try {
      new URL(input);
      setUrlError("");
      return true;
    } catch (error) {
      setUrlError("Please enter a valid URL including http:// or https://");
      return false;
    }
  };

  // Update QR code when user clicks the button
  const handleGenerateQR = () => {
    if (activeTab === "url") {
      if (validateUrl(url)) {
        // If we already have a preview QR code, update it with the user input
        if (previewQRCode) {
          const updatedQrCode = {
            ...previewQRCode,
            qr_code: {
              ...previewQRCode.qr_code,
              name: name || "Untitled QR Code",
              target: {
                // Zachowujemy oryginalny URL śledzący, ale aktualizujemy wyświetlany URL
                url: previewQRCode.qr_code.target.url,
                displayUrl: url
              },
              style: {
                ...previewQRCode.qr_code.style,
                foreground_color: qrColor
              }
            }
          };
          setPreviewQRCode(updatedQrCode);
          setShowPreview(true);
          setHasUnsavedChanges(true);
          toast.success("QR Code updated successfully");
        } else {
          // Rzadki przypadek, gdy nie mamy domyślnego kodu - spróbujmy wygenerować nowy
          generateQrPreview();
          setHasUnsavedChanges(true);
        }
      }
    } else if (activeTab === "product") {
      // Handle product QR code generation
      if (!selectedProduct) {
        toast.error("Please select a product first");
        return;
      }
      
      if (previewQRCode) {
        const updatedQrCode = {
          ...previewQRCode,
          qr_code: {
            ...previewQRCode.qr_code,
            name: name || `QR for ${selectedProduct.name}`,
            target: {
              // Zachowujemy oryginalny URL śledzący, ale dodajemy ID produktu
              url: previewQRCode.qr_code.target.url,
              displayUrl: `Product: ${selectedProduct.name}`,
              product_id: selectedProduct.id
            },
            style: {
              ...previewQRCode.qr_code.style,
              foreground_color: qrColor
            }
          }
        };
        setPreviewQRCode(updatedQrCode);
        setShowPreview(true);
        setHasUnsavedChanges(true);
        toast.success("Product QR Code generated successfully");
      } else {
        // Generuj nowy kod QR dla podglądu
        generateQrPreview();
        setHasUnsavedChanges(true);
      }
    }
  };

  // Generate QR code preview and save to database when user clicks Save button
  const saveQRCode = async () => {
    // Handle case if URL is missing and we're in URL tab
    if (activeTab === "url" && !url) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    // Handle case if product is missing and we're in Product tab
    if (activeTab === "product" && !selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    
    // If no preview QR code exists yet, generate one first
    if (!previewQRCode) {
      await generateQrPreview();
      // Continue directly with saving instead of returning early
    }
    
    setIsSaving(true);
    try {
      // Get the store hash from localStorage
      const storeHash = getStoreHash();
      
      // If no store hash is available, show error and redirect to HelloWorld
      if (!storeHash) {
        toast.error("No store context found. Please reconnect your store.");
        console.error("No store_hash available");
        navigate("/hello-world");
        return;
      }
      
      // Prepare data for API - zależy od aktywnej zakładki
      let apiEndpoint;
      let qrCodeData;
      
      if (activeTab === "url") {
        // Standardowy kod QR dla URL
        qrCodeData = {
          store_hash: storeHash,
          name: name,
          target: {
            url: url // We'll use the actual URL the user entered
          },
          style: {
            foreground_color: qrColor,
            background_color: "#FFFFFF",
            dots_style: dotStyle,
            corner_style: cornerStyle,
            corner_color: useCustomCornerColor ? cornerColor : undefined
          },
          campaign_id: null
        };
        apiEndpoint = "create_custom_url_qr_code";
      } else {
        // Kod QR dla produktu - poprawiona struktura zgodna z API
        qrCodeData = {
          store_hash: storeHash,
          name: name,
          product_id: selectedProduct?.id ? Number(selectedProduct.id) : 0, // Konwersja na liczbę, domyślna wartość 0 jeśli brak
          add_to_cart: false, // Domyślna wartość
          style: {
            foreground_color: qrColor,
            background_color: "#FFFFFF",
            dots_style: dotStyle,
            corner_style: cornerStyle,
            corner_color: useCustomCornerColor ? cornerColor : undefined
          },
          campaign_id: null
        };
        apiEndpoint = "create_product_qr_code";
      }
      
      console.log(`Saving ${activeTab} QR code with data:`, qrCodeData);
      
      try {
        // Call appropriate API endpoint based on QR code type
        const response = activeTab === "url" 
          ? await brain.create_custom_url_qr_code(qrCodeData)
          : await brain.create_product_qr_code(qrCodeData);
          
        const data = await response.json();
        
        if (data && data.qr_code && data.qr_code.id) {
          // Update saved QR code ID
          setSavedQrCodeId(data.qr_code.id);
          setHasUnsavedChanges(false);
          
          // Update the preview with the actual saved QR code
          const savedQrData = data.qr_code;
          const storeHash = getStoreHash(); // Ensure getStoreHash is available in this scope
          const trackingUrlForSaved = generateTrackingUrl(savedQrData.id, storeHash);

          setPreviewQRCode({
            qr_code: {
              ...savedQrData,
              url: trackingUrlForSaved, 
              target: {
                ...savedQrData.target,
                url: trackingUrlForSaved
              }
            }
          });

          // Update the global store
          qrCreationActions.setQrCodeId(savedQrData.id);
          qrCreationActions.setStoreHash(storeHash); // storeHash is already available in this scope
          
          // Stay on the page and show success notification
          toast.success("QR code successfully saved! Your QR code has been saved and is ready to use.");
        } else {
          toast.error("Failed to save QR code: Invalid response format");
          console.error("Invalid response format:", data);
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        
        // Let's try using fetch directly as a fallback
        console.log("Trying direct fetch as fallback...");
        // API_URL jest importowane na górze pliku z utils/api.ts
        
        const response = await fetch(`${API_URL}/custom`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(import.meta.env.DEV ? { credentials: "include" } : {}),
          },
          body: JSON.stringify(qrCodeData),
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        if (data && data.qr_code && data.qr_code.id) {
          // Update saved QR code ID
          setSavedQrCodeId(data.qr_code.id);
          setHasUnsavedChanges(false);
          // Stay on the page and show success notification
          toast.success("QR code successfully saved! Your QR code has been saved and is ready to use.");
        } else {
          toast.error("Failed to save QR code using fallback method");
          console.error("Invalid fallback response format:", data);
        }
      }
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast.error(`Failed to save QR code: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle QR code download
  const handleDownload = async (format: 'svg' | 'png' | 'pdf') => {
    if (!qrRef.current) return;
    
    setIsDownloading(true);
    try {
      // Use QR code name + ID for filename if available
      const filename = savedQrCodeId 
        ? `${name.replace(/\s+/g, '_')}_${savedQrCodeId.slice(-9)}` 
        : (name || "qrcode");
        
      if (savedQrCodeId) {
        // Use the API endpoint for saved QR codes
        await downloadQrImage(savedQrCodeId, filename, format);
      } else {
        // Use client-side rendering for unsaved QR codes (cannot use API without ID)
        await downloadQRCode(qrRef.current, filename, format);
      }
      
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error downloading QR code as ${format}:`, error);
      toast.error(`Failed to download QR code as ${format}`);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Legacy download QR code as SVG
  const downloadQRCodeAsSVG = () => {
    if (!qrRef.current) return;
    
    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    // Create a blob from the SVG content
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    
    // Use QR code name + ID for filename if available
    const filename = savedQrCodeId 
      ? `${name.replace(/\s+/g, '_')}_${savedQrCodeId.slice(-9)}` 
      : (name || "qrcode");
      
    downloadLink.download = `${filename}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast.success("QR code downloaded as SVG");
  };
  
  // Handle creating a new QR code
  const handleNewQR = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true);
    } else {
      resetForm();
    }
  };
  
  // Reset form to create a new QR code
  const resetForm = () => {
    setUrl("");
    setName("Untitled QR Code");
    setQrColor("#000000");
    setCornerColor("#000000");
    setUseCustomCornerColor(false);
    setDotStyle("square");
    setCornerStyle("square");
    setSavedQrCodeId(null);
    setHasUnsavedChanges(false);
    setUrlError("");
    setShowUnsavedChangesDialog(false);
    setSelectedProduct(null); // Reset selected product
    setActiveTab("url"); // Reset to URL tab as default
    generateQrPreview(); // Generate a new default QR code with preview
    toast.info("Started creating a new QR code");
  };

  return (
    <Layout>
      {/* Unsaved changes confirmation dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Unsaved Changes</h3>
            <p className="mb-4">
              You have unsaved changes to your QR code. Creating a new QR code will discard these changes. Do you want to continue?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowUnsavedChangesDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={resetForm}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create QR Code</h1>
          <p className="text-muted-foreground">Design and create a new QR code for your store.</p>
        </div>
        <Button onClick={handleNewQR}>
          <Plus className="mr-2 h-4 w-4" />
          New QR Code
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Details</CardTitle>
              <CardDescription>
                Configure the content and appearance of your QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger 
                    value="url" 
                    onClick={() => setActiveTab("url")}
                  >
                    URL
                  </TabsTrigger>
                  <TabsTrigger 
                    value="product" 
                    onClick={() => setActiveTab("product")}
                  >
                    Product
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Destination URL</Label>
                    <Input 
                      id="url" 
                      placeholder="https://yourdomain.com/page" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className={urlError ? "border-red-500" : ""}
                    />
                    {urlError ? (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {urlError}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Enter the full URL including http:// or https://</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="product" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Product</Label>
                    <ProductSearch 
                      storeHash={getStoreHash()} 
                      onSelectProduct={(product) => {
                        setSelectedProduct(product);
                        setName(product.name); // Auto-fill name with product name
                        setHasUnsavedChanges(true);
                      }} 
                    />
                    <p className="text-sm text-muted-foreground">Search and select a product from your store</p>
                  </div>
                  
                  {selectedProduct && (
                    <Alert className="bg-primary/10 border-primary">
                      <div className="flex items-start gap-3">
                        {selectedProduct.images && selectedProduct.images.length > 0 && (
                          <img 
                            src={selectedProduct.images[0].url_thumbnail} 
                            alt={selectedProduct.name} 
                            className="w-12 h-12 object-contain border rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{selectedProduct.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {selectedProduct.id}</p>
                          <p className="text-sm font-medium">${selectedProduct.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="space-y-2 mb-4">
                <Label htmlFor="qr-name">QR Code Name</Label>
                <Input 
                  id="qr-name" 
                  placeholder="Enter a name for your QR code" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Give your QR code a unique name for easy identification</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qr-color">QR Code Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex justify-between items-center font-normal"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: qrColor }}
                        />
                        {qrColor}
                      </div>
                      <Palette className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <div className="space-y-3">
                      <HexColorPicker color={qrColor} onChange={setQrColor} />
                      <div className="grid grid-cols-5 gap-1 mt-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-md border border-gray-200 ${qrColor === color ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setQrColor(color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                      <Input 
                        value={qrColor} 
                        onChange={(e) => setQrColor(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
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
                    <SelectGroup>
                      <SelectLabel>Dots Style</SelectLabel>
                      {dotStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
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
                    <SelectGroup>
                      <SelectLabel>Corner Style</SelectLabel>
                      {cornerStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
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
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex justify-between items-center font-normal"
                      disabled={!useCustomCornerColor}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: cornerColor }}
                        />
                        {cornerColor}
                      </div>
                      <Palette className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <div className="space-y-3">
                      <HexColorPicker color={cornerColor} onChange={setCornerColor} />
                      <div className="grid grid-cols-5 gap-1 mt-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-md border border-gray-200 ${cornerColor === color ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setCornerColor(color)}
                            aria-label={`Select corner color ${color}`}
                          />
                        ))}
                      </div>
                      <Input 
                        value={cornerColor} 
                        onChange={(e) => setCornerColor(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">Choose a custom color for corners (if different from dots)</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={saveQRCode}
                  disabled={isSaving || (
                    // Przycisk jest wyłączony tylko gdy:
                    // - trwa zapisywanie LUB
                    // - brak nazwy LUB
                    // - (w trybie URL brak URL) LUB (w trybie Product brak wybranego produktu)
                    !name || 
                    (activeTab === "url" && !url) ||
                    (activeTab === "product" && !selectedProduct)
                  )}
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500 mr-2"></div>
                  ) : savedQrCodeId && !hasUnsavedChanges ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {savedQrCodeId && !hasUnsavedChanges ? "Saved" : "Save QR Code"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                QR code preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 rounded-md">
              {showPreview && previewQRCode ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 rounded-md shadow-sm mb-4" ref={qrRef}>
                    {savedQrCodeId ? (
                      <img 
                        src={getQrImageUrl(savedQrCodeId, 'svg', 250)} 
                        alt="QR Code Preview" 
                        className="w-64 h-64 object-contain" 
                      />
                    ) : (
                      <CanvasQRCode 
                        value={previewQRCode.qr_code.target.url} 
                        size={200} 
                        level="M" // Medium error correction capability (15%)
                        includeMargin={true}
                        style={{
                          foreground_color: previewQRCode.qr_code.style.foreground_color,
                          background_color: previewQRCode.qr_code.style.background_color || "#FFFFFF",
                          dots_style: previewQRCode.qr_code.style.dots_style || "square",
                          corner_style: previewQRCode.qr_code.style.corner_style || "square",
                          corner_color: previewQRCode.qr_code.style.corner_color,
                          logo_url: previewQRCode.qr_code.style.logo_url,
                          logo_size: previewQRCode.qr_code.style.logo_size || 0
                        }}
                      />
                    )}
                  </div>
                  {/* Przyciski pobierania widoczne tylko po zapisaniu kodu QR */}
                  {savedQrCodeId && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => downloadQrImage(savedQrCodeId, name || "QR_Code", "svg")}>
                        <Download className="h-4 w-4 mr-2" />
                        Download QR
                      </Button>
                    </div>
                  )}
                  <div className="w-full text-center space-y-3">
                    {previewQRCode.qr_code.target.product_id && (
                      <p className="text-sm">
                        <span className="font-medium">Product ID: </span>{previewQRCode.qr_code.target.product_id}
                      </p>
                    )}
                    {previewQRCode.qr_code.target.category_id && (
                      <p className="text-sm">
                        <span className="font-medium">Category ID: </span>{previewQRCode.qr_code.target.category_id}
                      </p>
                    )}
                    {previewQRCode.qr_code.target.add_to_cart && (
                      <p className="text-sm flex items-center justify-center">
                        <ShoppingCart className="h-3 w-3 mr-1 inline" />
                        <span className="text-green-600 font-medium">Adds product to cart</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center">
                  <QrCode className="h-24 w-24 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">Your QR code will appear here after generation</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Sekcja z poradami usunięta */}
        </div>
      </div>
    </Layout>
  );
}
