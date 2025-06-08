import {
  AlertCircle,
  Link as LinkIcon,
  FileText,
  ListOrdered,
  Contact,
  Briefcase,
  Youtube,
  Image as ImageIcon,
  Facebook,
  Instagram,
  Users,
  MessageSquare, // Using MessageSquare for WhatsApp as direct icon might not be available
  Music2,
  BookOpen, // Using BookOpen for Menu
  AppWindow,
  Ticket,
  Wifi,
  Globe, // Alternative for Website
  BadgeHelp, // For Coming Soon or general help icon
} from "lucide-react";
import { useQrCreationStore } from "utils/qrCreationStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodePreview } from "components/QRCodePreview"; // Added import

interface QRType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  available: boolean;
  action?: () => void; // Optional: for specific actions if needed beyond setting type
}

const qrTypes: QRType[] = [
  {
    id: "url",
    title: "Website",
    description: "Link to any website URL",
    icon: Globe,
    available: true,
  },
  {
    id: "pdf",
    title: "PDF",
    description: "Show a PDF",
    icon: FileText,
    available: false,
  },
  {
    id: "links",
    title: "List of Links",
    description: "Share multiple links",
    icon: ListOrdered,
    available: false,
  },
  {
    id: "vcard",
    title: "vCard",
    description: "Share a digital business card",
    icon: Contact,
    available: false,
  },
  {
    id: "business",
    title: "Business",
    description: "Share information about your business",
    icon: Briefcase,
    available: false,
  },
  {
    id: "video",
    title: "Video",
    description: "Show a video",
    icon: Youtube,
    available: false,
  },
  {
    id: "images",
    title: "Images",
    description: "Share multiple images",
    icon: ImageIcon,
    available: false,
  },
  {
    id: "facebook",
    title: "Facebook",
    description: "Share your Facebook page",
    icon: Facebook,
    available: false,
  },
  {
    id: "instagram",
    title: "Instagram",
    description: "Share your Instagram",
    icon: Instagram,
    available: false,
  },
  {
    id: "social",
    title: "Social Media",
    description: "Share your social channels",
    icon: Users,
    available: false,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Get WhatsApp messages",
    icon: MessageSquare,
    available: false,
  },
  {
    id: "mp3",
    title: "MP3",
    description: "Share an audio file",
    icon: Music2,
    available: false,
  },
  {
    id: "menu",
    title: "Menu",
    description: "Create a restaurant menu",
    icon: BookOpen,
    available: false,
  },
  {
    id: "apps",
    title: "Apps",
    description: "Redirect to an app store",
    icon: AppWindow,
    available: false,
  },
  {
    id: "coupon",
    title: "Coupon",
    description: "Share a coupon",
    icon: Ticket,
    available: false,
  },
  {
    id: "wifi",
    title: "WiFi",
    description: "Connect to a Wi-Fi network",
    icon: Wifi,
    available: false,
  },
];

export default function SelectQRTypePage() {
  const navigate = useNavigate();
  const { qrType, setQrType, setCurrentStep } = useQrCreationStore((state) => ({
    qrType: state.qrType,
    setQrType: state.actions.setQrType,
    setCurrentStep: state.actions.setCurrentStep,
  }));

  const handleSelectType = (type: QRType) => {
    if (!type.available) return;
    setQrType(type.id);
    setCurrentStep(2);
    navigate("/define-qr-details");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
        {/* Left Column: Main Content - Wrapped in a Card */}
        <div className="flex-grow lg:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">1. Select a type of QR code</CardTitle>
              <CardDescription className="text-gray-600">Choose the type of content you want your QR code to link to.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {qrTypes.map((type) => {
                  const isSelected = qrType === type.id && type.available;
                  const IconComponent = type.icon;

                  return (
                    <Card
                      key={type.id}
                      onClick={() => handleSelectType(type)}
                      className={`
                        transition-all duration-200 ease-in-out transform hover:shadow-lg 
                        ${isSelected ? "border-2 border-green-500 ring-2 ring-green-500 ring-offset-1 bg-green-50/50" : "border-gray-200 hover:border-green-400"}
                        ${!type.available ? "opacity-60 cursor-not-allowed bg-gray-50 hover:border-gray-200" : "cursor-pointer bg-white"}
                      `}
                    >
                      <CardHeader className="relative p-4">
                        {!type.available && (
                          <Badge 
                            variant="secondary"
                            className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5"
                          >
                            Coming Soon
                          </Badge>
                        )}
                        <div className={`flex flex-col items-center justify-center text-center ${!type.available ? 'text-gray-400' : isSelected ? 'text-green-600' : 'text-gray-700'}`}>
                          <IconComponent 
                            className={`mb-3 h-10 w-10 ${!type.available ? 'text-gray-400' : isSelected ? 'text-green-500' : 'text-green-600'}`}
                            strokeWidth={1.5}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-center">
                        <CardTitle className={`text-lg font-semibold mb-1 ${!type.available ? 'text-gray-500' : 'text-gray-800'}`}>
                          {type.title}
                        </CardTitle>
                        <CardDescription className={`text-xs ${!type.available ? 'text-gray-400' : 'text-gray-500'}`}>
                          {type.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
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
