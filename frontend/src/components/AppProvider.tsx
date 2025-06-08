import React, { useEffect } from "react";
import { Toaster } from "sonner";
import { GlobalRedirectHandler } from "components/GlobalRedirectHandler";
import { useLocation } from "react-router-dom";
// import { Layout } from "components/Layout"; // Removed Layout import

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const location = useLocation();

  // Handle store_hash persistence
  useEffect(() => {
    // Get the search params from the URL
    const searchParams = new URLSearchParams(location.search);
    
    // Check if store_hash is in the URL parameters
    const storeHashFromUrl = searchParams.get("store_hash");
    
    // If store_hash is in the URL, save it to localStorage
    if (storeHashFromUrl) {
      console.log("🔒 Saving store_hash to localStorage:", storeHashFromUrl);
      localStorage.setItem("storeHash", storeHashFromUrl);
    }
    
    // Alternative: Also check for context parameter which contains store_hash
    const context = searchParams.get("context");
    if (context && context.includes("/")) {
      // Extract store_hash from context (format typically: stores/hash)
      const storeHashFromContext = context.split("/")[1];
      if (storeHashFromContext) {
        console.log("🔒 Saving store_hash from context to localStorage:", storeHashFromContext);
        localStorage.setItem("storeHash", storeHashFromContext);
      }
    }
  }, [location.search]);

  return (
    <>
      <GlobalRedirectHandler />
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}
