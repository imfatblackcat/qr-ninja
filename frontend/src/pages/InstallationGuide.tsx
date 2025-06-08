import React from "react";
import { Layout } from "components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstallationGuide() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container py-6 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Installation Guide</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2 className="text-xl font-bold mt-6 mb-3">Installation Steps</h2>
            
            <ol className="list-decimal pl-6 space-y-6">
              <li>
                <p><strong>Open the BigCommerce App Marketplace</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>From your BigCommerce control panel, navigate to the <strong>Apps</strong> section and click <strong>Marketplace</strong>.</li>
                  <li>Search for <strong>"QR Ninja"</strong>.</li>
                </ul>
              </li>
              
              <li>
                <p><strong>Single-Click Install</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>On the QR Ninja app listing, click <strong>Get this App</strong> (or <strong>Install</strong>).</li>
                  <li>Review the requested permissions and scope of access.</li>
                  <li>Click <strong>Confirm</strong> to start the single-click installation process.</li>
                </ul>
              </li>
              
              <li>
                <p><strong>Authorize (OAuth)</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>After clicking <strong>Confirm</strong>, BigCommerce will automatically redirect you to a secure authorization page for QR Ninja.</li>
                  <li>QR Ninja requests access to your store's data in order to generate and manage QR codes (e.g., for products, categories).</li>
                  <li>Choose <strong>Authorize</strong> to grant the app permission.</li>
                </ul>
              </li>
              
              <li>
                <p><strong>Automatic Account Creation</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Once authorization is complete, QR Ninja creates an account for your store <strong>automatically</strong>—no separate signup needed.</li>
                  <li>You'll then see a confirmation message or be taken to the app's welcome screen.</li>
                </ul>
              </li>
              
              <li>
                <p><strong>Accessing QR Ninja</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>In your BigCommerce control panel, go to <strong>Apps</strong> and select <strong>QR Ninja</strong> from your installed apps list.</li>
                  <li>You can now start generating, customizing, and tracking QR codes directly in your store's admin panel.</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
