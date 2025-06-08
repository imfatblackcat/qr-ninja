import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Store, Info, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import brain from "brain";
import { Button } from "@/components/ui/button";
import { useQrCreationStoreActions } from "utils/qrCreationStore"; // Added for resetStore
import { handleRedirectResponse, shouldCheckForRedirect } from "utils/redirectHandler";
import { Layout } from "components/Layout";
import { Badge } from "@/components/ui/badge";

export default function HelloWorld() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { resetStore } = useQrCreationStoreActions();
  
  // Get parameters directly from URL
  const context = searchParams.get("context") || "";
  const storeHash = searchParams.get("store_hash") || "";
  const storeName = searchParams.get("store_name") || "Your Store";
  const error = searchParams.get("error") || "";
  const errorMessage = searchParams.get("message") || "";
  
  // Logowanie informacji o załadowaniu strony HelloWorld
  useEffect(() => {
    console.log('🚨 HelloWorld page loaded with parameters:', {
      context,
      storeHash,
      storeName,
      error,
      errorMessage
    });
    
    // Save store_hash to localStorage if available in URL params
    if (storeHash) {
      console.log('💾 Saving store_hash to localStorage from HelloWorld page:', storeHash);
      localStorage.setItem('storeHash', storeHash);
    }
    
    // If context is available but not store_hash, extract and save it
    if (context && context.includes('/') && !storeHash) {
      const extractedHash = context.split('/')[1];
      if (extractedHash) {
        console.log('💾 Saving extracted store_hash from context:', extractedHash);
        localStorage.setItem('storeHash', extractedHash);
      }
    }
  }, [context, storeHash, storeName, error, errorMessage]);

  // Parse error message or use default
  const displayErrorMessage = errorMessage ? decodeURIComponent(errorMessage.replace(/\+/g, ' ')) : "An unknown error occurred";

  // Check for possible API response that should cause a redirect
  useEffect(() => {
    const checkForRedirect = async () => {
      try {
        // HelloWorld page often receives redirects from auth flow
        console.log('HelloWorld: Checking for redirect');
        console.log('Current URL:', window.location.href);
        console.log('URL params:', {
          context,
          storeHash,
          storeName,
          error,
          errorMessage
        });
        
        if (shouldCheckForRedirect()) {
          console.log('Page eligible for redirect check, fetching current URL...');
          const response = await fetch(window.location.href);
          const wasRedirected = await handleRedirectResponse(response);
          
          if (wasRedirected) {
            console.log('Redirect was handled successfully');
          } else {
            console.log('No redirect needed for this response');
          }
        } else {
          console.log('Page not eligible for redirect check, skipping');
        }
      } catch (err) {
        console.error('Error during redirect check:', err);
      }
    };
    
    checkForRedirect();
  }, [context, storeHash, storeName, error, errorMessage]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Loading your store data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello World</h1>
          <p className="text-muted-foreground">BigCommerce App Integration</p>
        </div>
        {!error && (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 flex items-center gap-1 px-3 py-1">
            <CheckCircle className="h-4 w-4" />
            <span>Active</span>
          </Badge>
        )}
      </div>
      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{displayErrorMessage}</AlertDescription>
                {error === "store_not_found" && (
                  <div className="mt-3 text-sm">
                    <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                    <span>The store could not be found in our database. You may need to reinstall the app.</span>
                  </div>
                )}
                {error === "inactive_store" && (
                  <div className="mt-3 text-sm">
                    <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                    <span>Your store is marked as inactive. Please reinstall the app to activate it.</span>
                  </div>
                )}
                <div className="mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="flex items-center"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" /> Refresh Page
                  </Button>
                </div>
              </Alert>
            ) : (
              <>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-center border border-blue-100">
                  <h1 className="text-5xl font-extrabold text-blue-600 mb-3 tracking-wide">Hello World!</h1>
                  <p className="text-lg text-blue-700">
                    Your app is successfully connected to your BigCommerce store.
                  </p>
                </div>
                
                {storeHash && (
                  <>
                    <div className="p-4 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center mb-3">
                        <Store className="h-5 w-5 mr-2 text-blue-500" />
                        <h3 className="font-medium">Store Connection</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 px-2 bg-gray-50 rounded">
                          <span className="text-gray-600">Store Hash:</span>
                          <span className="font-medium">{storeHash}</span>
                        </div>
                        <div className="flex justify-between py-1 px-2 bg-gray-50 rounded">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-green-600">Connected</span>
                        </div>
                        <div className="flex justify-between py-1 px-2 bg-gray-50 rounded">
                          <span className="text-gray-600">Store Name:</span>
                          <span className="font-medium">{storeName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 mr-2 text-yellow-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-yellow-700 mb-1">What's Next?</h3>
                          <p className="text-sm text-yellow-600">
                            This is a demonstration app that shows a successful BigCommerce integration.
                            In a real-world app, you would see your actual functionality here.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
        </CardContent>
      </Card>
      
      {/* App actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-blue-50 border border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">View BigCommerce Dashboard</CardTitle>
            <CardDescription className="text-blue-600">
              Access your store admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.open("https://login.bigcommerce.com/login", "_blank")}
            >
              Open BigCommerce
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Create QR Code</CardTitle>
            <CardDescription>
              Generate QR codes for your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => { resetStore(); navigate("/SelectQRType"); }}
            >
              New QR Code
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Browse Products</CardTitle>
            <CardDescription>
              View products in your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/products?store_hash=${storeHash}`)}
            >
              View Products
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>View Analytics</CardTitle>
            <CardDescription>
              Track QR code performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/stats")}
            >
              Go to Stats
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}