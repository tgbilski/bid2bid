
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";
import ExistingProject from "./pages/ExistingProject";
import MyProjects from "./pages/MyProjects";
import MyFavorites from "./pages/MyFavorites";
import Subscription from "./pages/Subscription";
import ManageSubscription from "./pages/ManageSubscription";
import EncryptionCompliance from "./pages/EncryptionCompliance";
import NotFound from "./pages/NotFound";

// Import RevenueCat SDK for Capacitor
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
// Import Supabase client
import { supabase } from './integrations/supabase/client';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // Set log level for debugging
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

        // Configure RevenueCat with your API key
        await Purchases.configure({
          apiKey: 'appl_EsygSTxcbirQHAXPSIRLcyXuGGD'
        });

        console.log("RevenueCat configured successfully");

        // Set up customer info listener
        Purchases.addCustomerInfoUpdateListener((customerInfo) => {
          console.log('RevenueCat Customer Info updated:', customerInfo);
          
          if (customerInfo.entitlements.active && Object.keys(customerInfo.entitlements.active).length > 0) {
            console.log("User has active entitlements");
          } else {
            console.log("User has no active entitlements");
          }
        });

        // Get initial session and set user ID
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await Purchases.logIn({ appUserID: session.user.id });
          console.log("RevenueCat user ID set to:", session.user.id);
        }

      } catch (error) {
        console.error("Error configuring RevenueCat:", error);
      }
    };

    initializeRevenueCat();

    // Listen for auth state changes to sync RevenueCat user ID
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user?.id) {
          // User logged in - set RevenueCat user ID
          await Purchases.logIn({ appUserID: session.user.id });
          console.log("RevenueCat user ID synced on login:", session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // User logged out - reset RevenueCat to anonymous
          await Purchases.logOut();
          console.log("RevenueCat user logged out");
        }
      } catch (error) {
        console.error("Error syncing RevenueCat user ID:", error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/project/:projectId" element={<ExistingProject />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/my-favorites" element={<MyFavorites />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/manage-subscription" element={<ManageSubscription />} />
            <Route path="/encryption-compliance" element={<EncryptionCompliance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
