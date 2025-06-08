import React, { useState } from "react";
import { Layout } from "components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Store, User, Bell, Cog, Mail, Webhook } from "lucide-react";

export default function Settings() {
  const [logoEnabled, setLogoEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your app settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 w-full max-w-[400px]">
          <TabsTrigger value="general" className="flex items-center">
            <Cog className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Appearance</CardTitle>
              <CardDescription>
                Customize how your QR codes look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="logo-enable" className="flex flex-col space-y-1">
                  <span>Add Logo to QR Codes</span>
                  <span className="font-normal text-sm text-muted-foreground">Include your store logo in the center of QR codes</span>
                </Label>
                <Switch
                  id="logo-enable"
                  checked={logoEnabled}
                  onCheckedChange={setLogoEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="default-url">Default URL Prefix</Label>
                <Input id="default-url" defaultValue="https://example.com/" />
                <p className="text-sm text-muted-foreground">This prefix will be automatically added to URLs without http:// or https://</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Connection</CardTitle>
              <CardDescription>
                Manage your BigCommerce store connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-green-50 border-green-100 flex items-start">
                <Store className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-700">Connected to BigCommerce</h3>
                  <p className="text-sm text-green-600 mt-1">Your app is successfully connected to your BigCommerce store.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Store Hash</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  xya123abc
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Disconnect Store
              </Button>
              <Button variant="outline">
                Refresh Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Merchant" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" defaultValue="Example Store" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal text-sm text-muted-foreground">Receive email alerts for QR code scans and reports</span>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              {emailNotifications && (
                <div className="space-y-2 pl-6 border-l-2 border-gray-100 ml-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input 
                    id="notification-email" 
                    type="email" 
                    defaultValue="notifications@example.com" 
                  />
                  <p className="text-sm text-muted-foreground">Reports and alerts will be sent to this email</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="flex items-center">
                  <Webhook className="mr-2 h-4 w-4" />
                  Webhook URL
                </Label>
                <Input 
                  id="webhook-url" 
                  placeholder="https://your-website.com/webhook" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">We'll send real-time scan data to this URL</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-3">Report Delivery Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="weekly-report" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="weekly-report">Weekly Summary (Monday)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="monthly-report" className="rounded border-gray-300" defaultChecked />
                    <Label htmlFor="monthly-report">Monthly Report (1st)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="scan-alerts" className="rounded border-gray-300" />
                    <Label htmlFor="scan-alerts">High Scan Volume Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="inactive-alerts" className="rounded border-gray-300" />
                    <Label htmlFor="inactive-alerts">Inactive QR Alerts</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
