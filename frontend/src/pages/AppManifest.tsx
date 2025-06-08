import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BIGCOMMERCE_APP_MANIFEST } from "utils/bigCommerceManifest";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check } from "lucide-react";

export default function AppManifest() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("json");

  // Format the manifest for display
  const jsonManifest = JSON.stringify(BIGCOMMERCE_APP_MANIFEST, null, 2);
  
  // YAML format (simplified conversion)
  const formatYaml = (obj: any, indent = 0): string => {
    let yaml = "";
    const spaces = " ".repeat(indent);
    
    for (const key in obj) {
      const value = obj[key];
      if (value === null) {
        yaml += `${spaces}${key}: null\n`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            yaml += formatYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === "object") {
        yaml += `${spaces}${key}:\n`;
        yaml += formatYaml(value, indent + 2);
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  };
  
  const yamlManifest = formatYaml(BIGCOMMERCE_APP_MANIFEST);

  const copyToClipboard = () => {
    const textToCopy = activeTab === "json" ? jsonManifest : yamlManifest;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">BigCommerce App Manifest</CardTitle>
            <CardDescription>
              Use this manifest when registering your app in the BigCommerce Developer Portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                <p><strong>Important:</strong> Replace all placeholder values (marked with {'{{'} and {'}}'}) with your actual values before submission.</p>
                <ul className="list-disc list-inside mt-2">
                  <li>APP_URL: Your deployed app URL</li>
                  <li>APP_DOMAIN: Your app's domain without protocol</li>
                  <li>BIGCOMMERCE_CLIENT_ID: Provided by BigCommerce during app creation</li>
                  <li>BIGCOMMERCE_CLIENT_SECRET: Provided by BigCommerce during app creation</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="json" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="json">JSON Format</TabsTrigger>
                <TabsTrigger value="yaml">YAML Format</TabsTrigger>
              </TabsList>
              <TabsContent value="json">
                <div className="relative">
                  <pre className="bg-slate-800 p-4 rounded-md text-slate-100 overflow-x-auto text-sm">
                    {jsonManifest}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2 bg-slate-700 text-white hover:bg-slate-600"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="yaml">
                <div className="relative">
                  <pre className="bg-slate-800 p-4 rounded-md text-slate-100 overflow-x-auto text-sm whitespace-pre">
                    {yamlManifest}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2 bg-slate-700 text-white hover:bg-slate-600"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <h2 className="text-lg font-medium">Instructions for Using the Manifest:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Copy the JSON or YAML content above</li>
                <li>Go to the <a href="https://devtools.bigcommerce.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">BigCommerce Developer Portal</a></li>
                <li>Create a new app or edit your existing app</li>
                <li>Paste the manifest in the Technical section</li>
                <li>Replace all placeholder values with your actual credentials</li>
                <li>Submit your app for review</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}