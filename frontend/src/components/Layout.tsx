import React from "react";
import { useQrCreationStoreActions } from "utils/qrCreationStore"; // Added for resetStore
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Settings,
  QrCode,
  List,
  Menu,
  X,
  HelpCircle,
  Mail,
  ExternalLink,
  Store
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { resetStore } = useQrCreationStoreActions();

  const navigation = [
    { name: "New QR", href: "/SelectQRType", icon: QrCode, action: () => resetStore() },
    { name: "My QR Codes", href: "/my-qr-codes", icon: List },
    { name: "Stats", href: "/stats", icon: BarChart },
    // Settings page hidden per request
    // { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center h-12 px-4 mb-4">
            <div className="flex items-center space-x-2">
              <QrCode className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Hello Commerce</span>
            </div>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`w-full justify-start ${isActive(item.href) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => {
                  if (item.action) item.action();
                  navigate(item.href);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="px-3 mt-auto">
            <Separator className="my-3" />
            <nav className="space-y-1 mb-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:bg-gray-100"
                onClick={() => window.open("#", "_blank")}
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                Help
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:bg-gray-100"
                onClick={() => window.open("#", "_blank")}
              >
                <Mail className="mr-3 h-5 w-5" />
                Contact
              </Button>
            </nav>
            <div className="flex items-center px-2 py-2 text-sm text-gray-500">
              <Store className="h-4 w-4 mr-2" />
              <span>BigCommerce App</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <QrCode className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">Hello Commerce</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-12 z-20 bg-white">
          <nav className="p-3 space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`w-full justify-start ${isActive(item.href) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => {
                  if (item.action) item.action();
                  navigate(item.href);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <main className="relative flex-1 overflow-y-auto focus:outline-none md:pt-0 pt-14">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Hello Commerce. All rights reserved.
            </div>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
              <a 
                onClick={() => navigate('/installation-guide')} 
                className="cursor-pointer flex items-center hover:text-gray-700"
              >
                Installation Guide
              </a>
              <a 
                onClick={() => navigate('/user-guide')} 
                className="cursor-pointer flex items-center hover:text-gray-700"
              >
                User Guide
              </a>
              <a 
                onClick={() => navigate('/privacy-policy')} 
                className="cursor-pointer flex items-center hover:text-gray-700"
              >
                Privacy Policy
              </a>
              <a 
                onClick={() => navigate('/terms-of-service')} 
                className="cursor-pointer flex items-center hover:text-gray-700"
              >
                Terms of Service
              </a>
              <a 
                href="https://developer.bigcommerce.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                BigCommerce Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
