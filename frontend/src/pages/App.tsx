import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { Layout } from "components/Layout"; // Removed Layout import

export default function App() {
  const navigate = useNavigate();

  // Fallback handler for when JSON content is displayed as text on homepage
  useEffect(() => {
    // Check if the page content looks like a JSON response with redirect_url
    const checkForDisplayedJson = () => {
      try {
        // Get the text from the body if it's displayed
        const bodyText = document.body.innerText || '';
        
        // If we're on the homepage and we see JSON that shouldn't be here
        if (window.location.pathname === '/' && bodyText.includes('"redirect_url"') && (bodyText.includes('"status"') || bodyText.includes('"message"'))) {
          console.log('🚨 HomePage: Detected JSON content displayed as text, attempting to parse');
          
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
                    window.location.href = window.location.origin + data.redirect_url;
                  } else {
                    window.location.href = window.location.origin + '/' + data.redirect_url;
                  }
                }
                return true;
              }
              
              // If we have an error message but no redirect, show it
              // This part might need a way to display errors if Layout is removed
              // For now, focusing on redirect. Error display can be handled if needed.
              // if (data.status === 'error' && data.message) {
              //   setError(`Error: ${data.message}`);
              //   return true;
              // }
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

  // Auto-redirect to the hello-world page when the main page is loaded
  useEffect(() => {
    console.log('Redirecting from main page to hello-world');
    navigate('/hello-world');
  }, [navigate]);

  return (
    // Removed Layout component wrapper
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Loading application...</p>
        <p className="text-sm text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
