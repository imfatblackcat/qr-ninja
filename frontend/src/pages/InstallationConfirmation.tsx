import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ExternalLink, ArrowLeft, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { handleRedirectResponse, shouldCheckForRedirect } from "utils/redirectHandler";

export default function InstallationConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status") || "";
  
  // Fallback handler for when JSON content is displayed as text
  useEffect(() => {
    // Check if the page content looks like a JSON response with redirect_url
    const checkForDisplayedJson = () => {
      try {
        // Get the text from the body if it's displayed
        const bodyText = document.body.innerText || '';
        
        // Check if it looks like our JSON response format
        if (bodyText.includes('"redirect_url"') && (bodyText.includes('"status"') || bodyText.includes('"message"'))) {
          console.log('🚨 InstallationConfirmation: Detected JSON content displayed as text, attempting to parse');
          
          try {
            // Try to parse it as JSON
            const jsonMatch = bodyText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const data = JSON.parse(jsonStr);
              
              console.log('🚨 Successfully parsed JSON from page content:', data);
              
              if (data.redirect_url) {
                console.log('🚨 Found redirect_url in parsed JSON, redirecting to:', data.redirect_url);
                
                // Handle the redirect
                if (data.redirect_url.startsWith('http')) {
                  window.location.href = data.redirect_url;
                } else {
                  // For relative URLs
                  if (data.redirect_url.startsWith('/')) {
                    navigate(data.redirect_url);
                  } else {
                    navigate('/' + data.redirect_url);
                  }
                }
                return true;
              }
            }
          } catch (jsonError) {
            console.error('🚨 Error parsing JSON from page content:', jsonError);
          }
        }
        return false;
      } catch (e) {
        console.error('🚨 Error in checkForDisplayedJson:', e);
        return false;
      }
    };
    
    // Run the check after a short delay to ensure the DOM is fully loaded
    setTimeout(() => {
      const jsonDetected = checkForDisplayedJson();
      if (jsonDetected) {
        console.log('🚨 JSON content was handled by the fallback handler');
      }
    }, 300);
  }, [navigate]);
  const storeHash = searchParams.get("store_hash") || "";
  const message = searchParams.get("message") || "";
  const isSingleClick = searchParams.get("single_click") === "true";
  const errorCode = searchParams.get("error_code") || "";
  const isSuccess = status === "success" && storeHash;
  
  // Check for possible API response that should cause a redirect
  useEffect(() => {
    const checkForRedirect = async () => {
      try {
        // This page is specifically important for redirect handling
        // as it's often the target of BigCommerce OAuth callback
        console.log('InstallationConfirmation: Checking for redirect');
        console.log('Current URL:', window.location.href);
        
        if (shouldCheckForRedirect()) {
          console.log('Page eligible for redirect check, fetching current URL...');
          const response = await fetch(window.location.href);
          const wasRedirected = await handleRedirectResponse(response);
          
          if (wasRedirected) {
            console.log('Redirect was handled successfully');
          } else {
            console.log('No redirect needed for this response');
            console.log('Current URL params:', window.location.search);
          }
        } else {
          console.log('Page not eligible for redirect check, skipping');
        }
      } catch (err) {
        console.error('Error during redirect check:', err);
      }
    };
    
    checkForRedirect();
  }, []);
  
  // For logging and debugging purposes
  useEffect(() => {
    // Log installation outcome for debugging
    if (isSuccess) {
      console.log(`Installation successful for store ${storeHash}`);
    } else if (status === "error") {
      console.error(`Installation failed: ${message} (Error code: ${errorCode})`);
    }
  }, [isSuccess, status, storeHash, message, errorCode]);

  // Helper function to provide specific guidance based on error code
  function getErrorHelp(code: string, msg: string): string {
    switch(code) {
      case 'MISSING_PARAMS':
        return 'The installation request is missing required parameters. This could be due to an incorrect URL or a problem with the BigCommerce redirection.';
      case 'CONFIG_ERROR':
        return 'There is a configuration issue with the app. Please contact the app developer.';
      case 'AUTH_FAILED':
        return 'BigCommerce authentication failed. This could be due to invalid credentials or expired authorization code.';
      case 'CONNECTION_ERROR':
        return 'There was a network issue while communicating with BigCommerce. Please check your internet connection and try again.';
      case 'PARSE_ERROR':
        return 'There was an error processing the response from BigCommerce. Please try again later.';
      case 'SERVER_ERROR':
        return 'An unexpected server error occurred. Please try again later or contact support if the issue persists.';
      default:
        if (code.startsWith('BC_')) {
          return `BigCommerce reported an error: ${msg}. Please try again or contact BigCommerce support if the issue persists.`;
        }
        return 'An unexpected error occurred during installation. Please try again later.';
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Installation Status</CardTitle>
            <CardDescription>
              {isSuccess ? "Your app has been successfully installed!" : "There was an issue with installation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertTitle className="text-green-700">Success!</AlertTitle>
                <AlertDescription className="text-green-600">
                  The app has been successfully installed on your BigCommerce store.
                  <Button 
                  variant="default" 
                  className="mt-4 flex items-center gap-1 w-full"
                  onClick={() => navigate('/hello-world')}
                >
                  Go to App Dashboard
                </Button>

                {isSingleClick ? (
                    <> You can now access it from your BigCommerce admin panel <strong>Apps</strong> section.</>  
                  ) : (
                    <> You can now access it from your BigCommerce admin panel.</>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-700">Installation Failed</AlertTitle>
                <AlertDescription className="text-red-600">
                  {message || "There was an issue installing the app on your store."}
                  {errorCode && <div className="mt-1 text-sm text-red-500">Error code: {errorCode}</div>}
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-slate-50 rounded-lg">
              <h2 className="text-lg font-medium mb-2">What's Next?</h2>
              {isSuccess ? (
                <div className="space-y-3">
                  <p>
                    You can now access the app from your BigCommerce admin panel.
                    {isSingleClick ? (
                      <> The app has been installed using the one-click installation process.</>
                    ) : null}
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="font-medium text-gray-700">To access your app:</h3>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to your BigCommerce store admin panel</li>
                      <li>Navigate to <strong>Apps &gt; My Apps</strong></li>
                      <li>Find and click on the app</li>
                      <li>You'll see the Hello World message in your admin panel</li>
                    </ol>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-2 flex items-center gap-1"
                    onClick={() => window.open("https://login.bigcommerce.com/login", "_blank")}
                  >
                    Go to BigCommerce Login
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p>
                    Please try installing the app again from the main page. If you continue to 
                    experience issues, contact support for assistance.
                  </p>
                  
                  {errorCode && (
                    <div className="mt-4">
                      <Separator className="my-3" />
                      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded border border-slate-200">
                        <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium">Troubleshooting Information</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {getErrorHelp(errorCode, message)}
                          </p>
                          <div className="mt-2 p-1.5 bg-slate-100 rounded text-xs font-mono">
                            Error Code: {errorCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {isSuccess && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-medium mb-2 text-blue-700">Store Information</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-sm font-medium text-blue-600">Store Hash:</span>
                    <div className="mt-1 font-mono text-sm bg-gray-50 p-1 rounded">{storeHash}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-sm font-medium text-blue-600">Installation Type:</span>
                    <div className="mt-1 bg-gray-50 p-1 rounded text-sm">
                      {isSingleClick ? "Single-click (Marketplace)" : "Manual Installation"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-48"
              variant={isSuccess ? "default" : "outline"}
            >
              {isSuccess ? "Return to Home" : (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}