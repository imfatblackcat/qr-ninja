import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQrCreationStore } from "utils/qrCreationStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, UploadCloud, Trash2, Palette, Image as ImageIcon } from "lucide-react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodePreview } from "components/QRCodePreview"; // Added import

// Color options for quick selection
const colorOptions = [
  "#FF6900",
  "#FCB900",
  "#7BDCB5",
  "#00D084",
  "#8ED1FC",
  "#0693E3",
  "#ABB8C3",
  "#EB144C",
  "#F78DA7",
  "#9900EF",
];

const dotStyleOptions = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "honeycomb", label: "Honeycomb" },
  { value: "classy", label: "Diamond" }
];

const cornerStyleOptions = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" }
];

export default function CustomizeQRVisualsPage() {
  const navigate = useNavigate();
  const store = useQrCreationStore();
  const {
    qrForegroundColor,
    qrBackgroundColor,
    qrDotsStyle,
    qrCornerStyle,
    qrCornerColor: initialCornerColor, // Renamed to avoid conflict
    qrLogoUrl,
    qrLogoSize,
    currentStep,
    // Actions
    setQrForegroundColor,
    setQrBackgroundColor,
    setQrDotsStyle,
    setQrCornerStyle,
    setQrCornerColor,
    setQrLogoUrl,
    setQrLogoSize,
    setCurrentStep,
  } = useQrCreationStore((state) => ({ 
    qrForegroundColor: state.qrStyles.qrForegroundColor,
    qrBackgroundColor: state.qrStyles.qrBackgroundColor,
    qrDotsStyle: state.qrStyles.dotsStyle,
    qrCornerStyle: state.qrStyles.cornerStyle,
    qrCornerColor: state.qrStyles.useCustomCornerColor ? state.qrStyles.qrCornerColor : state.qrStyles.qrForegroundColor, 
    qrLogoUrl: state.qrStyles.logoUrl,
    qrLogoSize: state.qrStyles.logoSize,
    currentStep: state.currentStep,
    setQrForegroundColor: state.actions.setQrForegroundColor,
    setQrBackgroundColor: state.actions.setQrBackgroundColor,
    setQrDotsStyle: state.actions.setQrDotsStyle,
    setQrCornerStyle: state.actions.setQrCornerStyle,
    setQrCornerColor: state.actions.setQrCornerColor,
    setQrLogoUrl: state.actions.setQrLogoUrl,
    setQrLogoSize: state.actions.setQrLogoSize,
    setCurrentStep: state.actions.setCurrentStep,
  }));

  // Local state for custom corner color to be potentially different from foreground
  // No longer need local state for fgColor and bgColor as they are updated directly in Zustand
  const [customCornerColor, setCustomCornerColor] = useState(initialCornerColor); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStep < 2 || !store.destinationUrl) {
      navigate("/define-qr-details");
    }
  }, [currentStep, store.destinationUrl, navigate]);

  const handleNext = () => {
    // Ensure custom corner color is saved if it was being edited
    if (store.qrStyles.useCustomCornerColor) {
      setQrCornerColor(customCornerColor);
    }
    setCurrentStep(4);
    navigate("/save-and-download-qr");
    toast.success("Visuals customized! Almost there.");
  };

  const handleBack = () => {
    // Ensure custom corner color is saved if it was being edited before going back
    if (store.qrStyles.useCustomCornerColor) {
      setQrCornerColor(customCornerColor);
    }
    setCurrentStep(2);
    navigate("/define-qr-details");
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Logo file is too large. Max 2MB allowed.");
        return;
      }
      if (!["image/png", "image/jpeg", "image/gif", "image/svg+xml"].includes(file.type)) {
        toast.error("Invalid logo file type. Use PNG, JPG, GIF or SVG.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrLogoUrl(reader.result as string);
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeLogo = () => {
    setQrLogoUrl("");
    setQrLogoSize(0); // Reset logo size as well, or to a default if preferred
    toast.info("Logo removed.");
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const ColorPickerPopover = ({ label, color, onChange }: {
    label: string;
    color: string;
    onChange: (newColor: string) => void;
  }) => {
    const pickerControlsRef = React.useRef<HTMLDivElement>(null); // Ref is now local to each instance
    return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        {/* Przywrócona zawartość Triggera */}
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <div className="flex items-center">
            <div
              className="w-5 h-5 rounded-sm border border-gray-300 mr-2"
              style={{ backgroundColor: color }}
            />
            {label}: {color}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div ref={pickerControlsRef}>
          <HexColorPicker color={color} onChange={onChange} />
          <div className="p-2 border-t border-gray-200">
            <HexColorInput prefixed color={color} onChange={onChange} className="w-full p-1 border border-gray-300 rounded text-sm"/>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {colorOptions.map((optColor) => (
                <button
                  key={optColor}
                  className="w-7 h-7 rounded-sm border border-gray-300 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: optColor }}
                  onClick={() => onChange(optColor)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
 }; // Closing brace for ColorPickerPopover

 return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
            {/* Left Column: Customization Controls */}
            <div className="flex-grow lg:w-2/3">
                <Card className="w-full shadow-lg rounded-lg h-full">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Step 3: Customize QR Code Visuals</CardTitle>
                        <CardDescription>
                            Adjust colors, shapes, and add a logo to make your QR code unique.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Colors Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center"><Palette className="w-4 h-4 mr-2" /> QR Code Color</Label>
                                <ColorPickerPopover
                                    label="Foreground"
                                    color={qrForegroundColor} // Directly use Zustand state
                                    onChange={setQrForegroundColor} // Directly use Zustand action
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center"><Palette className="w-4 h-4 mr-2" /> Background Color</Label>
                                <ColorPickerPopover
                                    label="Background"
                                    color={qrBackgroundColor} // Directly use Zustand state
                                    onChange={setQrBackgroundColor} // Directly use Zustand action
                                />
                            </div>
                        </div>

                        {/* Styles Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dots-style">Dots Style</Label>
                                <Select value={qrDotsStyle} onValueChange={setQrDotsStyle}>
                                    <SelectTrigger id="dots-style">
                                        <SelectValue placeholder="Select dot style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dotStyleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="corner-style">Corner Style</Label>
                                <Select value={qrCornerStyle} onValueChange={setQrCornerStyle}>
                                    <SelectTrigger id="corner-style">
                                        <SelectValue placeholder="Select corner style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cornerStyleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        {/* Custom Corner Color - only if corner style is not square (or relevant styles) */}
                        {(qrCornerStyle === "rounded" || qrCornerStyle === "dots") && (
                             <div className="space-y-2">
                                <Label className="flex items-center"><Palette className="w-4 h-4 mr-2" /> Custom Corner Color</Label>
                                <ColorPickerPopover
                                    label="Corner Color"
                                    color={customCornerColor} // Use local state for custom corner color
                                    onChange={setCustomCornerColor} // Update local state
                                />
                                <p className="text-xs text-muted-foreground">Applies to rounded or dot corner styles. Defaults to QR code color if not set.</p>
                            </div>
                        )}

                        {/* Logo Section */}
                        <div className="space-y-2 pt-4 border-t">
                            <Label className="flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Add Logo (Optional)</Label>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" onClick={triggerFileInput} className="flex-grow">
                                    <UploadCloud className="mr-2 h-4 w-4" /> {qrLogoUrl ? "Change Logo" : "Upload Logo"}
                                </Button>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif, image/svg+xml"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                {store.qrLogoUrl && (
                                    <Button variant="destructive" onClick={removeLogo} size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove logo</span>
                                    </Button>
                                )}
                            </div>
                            {qrLogoUrl && (
                                <div className="mt-4 space-y-2">
                                   <div className="flex items-center gap-2">
                                        <img src={qrLogoUrl} alt="Logo preview" className="h-12 w-12 object-contain border rounded-md" />
                                        <p className="text-xs text-muted-foreground">Current logo</p>
                                    </div>
                                    <Label htmlFor="logo-size">Logo Size (1-10)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="range" 
                                            id="logo-size"
                                            min="0" 
                                            max="10" 
                                            step="0.5" 
                                            value={qrLogoSize || 0}
                                            onChange={(e) => setQrLogoSize(parseFloat(e.target.value))} 
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                                        />
                                        <span className="text-sm w-8 text-center">{qrLogoSize || 0}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Adjust the size of the logo within the QR code. 0 means no logo.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-6">
                        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back (Step 2)
                        </Button>
                        <Button onClick={handleNext}>
                            Next: Save & Download (Step 4)
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right Column: QR Code Preview */}
            <div className="lg:w-1/3 lg:max-w-sm mt-8 lg:mt-0 h-full">
                <QRCodePreview /> 
            </div>
        </div>
    </div>
  );
}
