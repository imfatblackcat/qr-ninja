import React from "react";
import { Layout } from "components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserGuide() {
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
            <CardTitle className="text-2xl font-bold">User Guide</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2 className="text-xl font-bold mt-6 mb-3">1. Generating New QR Codes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Products & Categories</strong>: Select an item or category from your BigCommerce store. QR Ninja automatically links to that page so customers can scan and view product details or category listings.</li>
              <li><strong>External Links</strong>: Need a QR code for a blog post, social media page, or any other URL? Simply paste your link, and the app will generate a code pointing there.</li>
            </ul>
            
            <p className="font-medium mt-4">How to Do It:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click <strong>"New QR"</strong> in the app dashboard.</li>
              <li>Choose the QR <strong>Type</strong> (Product, Category, External Link, etc.).</li>
              <li>Fill in any required details (product ID, URL, discount code).</li>
              <li>Click <strong>"Save QR Code"</strong> to see your new code.</li>
            </ol>
            
            <div className="my-6 border-t border-gray-200"></div>
            
            <h2 className="text-xl font-bold mt-6 mb-3">2. Editing Existing QR Codes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Locate the code you want to update in the <strong>My QR Codes</strong>.</li>
              <li>Click <strong>"Edit"</strong> to modify its target link, appearance, or discount details.</li>
              <li>Changes take effect immediately - no need to regenerate a new code from scratch.</li>
            </ul>
            
            <div className="my-6 border-t border-gray-200"></div>
            
            <p className="font-medium mt-4">Best Practice: Keep the design <strong>simple and high-contrast</strong> so the code remains easy to scan.</p>
            
            <div className="my-6 border-t border-gray-200"></div>
            
            <h2 className="text-xl font-bold mt-6 mb-3">3. Viewing Usage Statistics</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stats</strong>: See how many times each code has been scanned, plus a date filter to spot trends or seasonal spikes.</li>
              <li><strong>Performance Insights</strong>: Compare scans across multiple codes to learn which campaigns resonate best with your customers.</li>
            </ul>
            
            <div className="my-6 border-t border-gray-200"></div>
            
            <h2 className="text-xl font-bold mt-6 mb-3">4. Tracking Explained</h2>
            <p>Each QR code uses a special <strong>redirect link</strong> to gather scan data before sending users to the final destination. When someone scans the code:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>They briefly hit our secure endpoint (where the scan is logged).</li>
              <li>They're then <strong>redirected</strong> to your chosen product page, category, or external URL.</li>
            </ol>
            
            <p>This approach ensures accurate scan counts without extra steps for your customers.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
