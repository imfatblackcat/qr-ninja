import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQrCreationStore } from "utils/qrCreationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { QRCodePreview } from "components/QRCodePreview"; // Added import

export default function DefineQRDetailsPage() {
  const navigate = useNavigate();
  const {
    destinationUrl,
    qrName,
    setDestinationUrl,
    setQrName,
    setCurrentStep,
    currentStep,
  } = useQrCreationStore((state) => ({
    destinationUrl: state.destinationUrl,
    qrName: state.qrName,
    setDestinationUrl: state.actions.setDestinationUrl,
    setQrName: state.actions.setQrName,
    setCurrentStep: state.actions.setCurrentStep,
    currentStep: state.currentStep,
  }));

  const [localUrl, setLocalUrl] = useState(destinationUrl || "");
  const [localName, setLocalName] = useState(qrName || "");
  const [urlError, setUrlError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    // Ensure this step is only accessible if previous steps were completed
    if (currentStep < 1) {
      // Or if qrType is not set, navigate to the first step
      navigate("/select-qr-type");
    }
  }, [currentStep, navigate]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleNext = () => {
    let valid = true;
    if (!localUrl.trim()) {
      setUrlError("Target URL cannot be empty.");
      valid = false;
    } else if (!isValidUrl(localUrl)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com).");
      valid = false;
    } else {
      setUrlError("");
    }

    if (!localName.trim()) {
      setNameError("QR Code Name cannot be empty.");
      valid = false;
    } else {
      setNameError("");
    }

    if (valid) {
      setDestinationUrl(localUrl);
      setQrName(localName);
      setCurrentStep(3); // Set current step to 3 for CustomizeQRVisuals
      navigate("/customize-qr-visuals");
      toast.success("Details saved! Now let's customize your QR code.");
    }
  };

  const handleBack = () => {
    // Save current inputs to Zustand before going back
    setDestinationUrl(localUrl); 
    setQrName(localName);
    setCurrentStep(1); // Set current step back to 1
    navigate("/select-qr-type");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
        {/* Left Column: Main Content */}
        <div className="flex-grow lg:w-2/3">
          <Card className="w-full shadow-lg rounded-lg h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Step 2: Provide QR Code Details</CardTitle>
              <CardDescription>
                Enter the destination URL and a name for your QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="destinationUrl" className="text-sm font-medium">
                  Target URL
                </Label>
                <Input
                  id="destinationUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={localUrl}
                  onChange={(e) => {
                    setLocalUrl(e.target.value);
                    if (urlError) setUrlError(""); // Clear error on change
                    // Update store live for preview
                    setDestinationUrl(e.target.value);
                  }}
                  className={urlError ? "border-red-500 focus:border-red-500" : ""}
                  aria-describedby="url-error"
                />
                {urlError && (
                  <p id="url-error" className="text-xs text-red-600">
                    {urlError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrName" className="text-sm font-medium">
                  QR Code Name
                </Label>
                <Input
                  id="qrName"
                  type="text"
                  placeholder="My Awesome QR Code"
                  value={localName}
                  onChange={(e) => {
                    setLocalName(e.target.value);
                    if (nameError) setNameError(""); // Clear error on change
                    // Update store live for preview (optional, name doesn't affect QR image itself)
                    // setQrName(e.target.value); 
                  }}
                  className={nameError ? "border-red-500 focus:border-red-500" : ""}
                  aria-describedby="name-error"
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-red-600">
                    {nameError}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back (Step 1)
              </Button>
              <Button onClick={handleNext} >
                Next: Customize Visuals (Step 3)
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
