import React from "react";
import { Layout } from "components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
            <CardTitle className="text-2xl font-bold">Terms of Service for QR Ninja</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p><strong>Effective Date:</strong> April 14, 2025</p>
            
            <p>These Terms of Service ("Terms") govern your access to and use of the QR Ninja SaaS application ("Service"), developed for the BigCommerce platform.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-3">Definitions:</h2>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service:</strong> Refers to the QR Ninja application and associated functionalities provided via the BigCommerce platform.</li>
              <li><strong>User:</strong> The individual or business entity utilizing the Service.</li>
              <li><strong>Provider:</strong> QR Ninja, the developer and provider of the Service.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-3">Terms of Use:</h2>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Installation:</strong> Users can install QR Ninja directly from the BigCommerce App Store. Installation constitutes acceptance of these Terms.</li>
              <li><strong>Usage:</strong> Users may use the Service to create, customize, and manage QR codes for marketing and business purposes related to their BigCommerce store.</li>
              <li><strong>Limitations of Liability:</strong> The Provider is not liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to the use or inability to use the Service.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-3">Billing and Payments:</h2>
            
            <p>Currently, QR Ninja is offered free of charge. We reserve the right to introduce paid subscription plans in the future. Users will receive a 30-day free trial period upon switching to any future paid subscription plans.</p>
            
            <p>Subscription fees, if applicable, will be clearly stated, and Users will be notified in advance.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-3">Termination:</h2>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Users may terminate the use of the Service at any time by uninstalling the App from their BigCommerce store.</li>
              <li>Upon termination, all user-related data will be permanently deleted within 30 days, except as required by law.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-3">Provider Liability:</h2>
            
            <p>The Provider is not responsible for the content of QR codes or any interactions resulting from their use by end-users. The responsibility for content and its legality rests entirely with the User.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-3">Governing Law and Contact Information:</h2>
            
            <p>These Terms shall be governed by and construed in accordance with the laws of Poland.</p>
            
            <p>For questions or concerns about these Terms, contact us at:</p>
            
            <p className="whitespace-pre-line font-medium">
              Get Robo
              Stefana Banacha 29a/54
              31-235 Cracow
              Poland
              info@getrobo.xyz
            </p>
            
            <p>Thank you for using QR Ninja!</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
