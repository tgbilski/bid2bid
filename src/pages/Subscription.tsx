import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Purchases } from '@revenuecat/purchases-capacitor';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Subscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadOfferings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    await checkSubscription();
  };

  const loadOfferings = async () => {
    try {
      const offeringsResult = await Purchases.getOfferings();
      if (offeringsResult.current !== null) {
        setOfferings(offeringsResult.current);
        console.log('RevenueCat offerings loaded:', offeringsResult.current);
      }
    } catch (error) {
      console.error('Error loading RevenueCat offerings:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      // First check RevenueCat customer info
      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = (customerInfo as any).entitlements?.active || {};
      const hasActiveSubscription = Object.keys(activeEntitlements).length > 0;
      
      console.log('RevenueCat customer info:', customerInfo);
      console.log('Has active subscription:', hasActiveSubscription);

      // Also check Supabase backend for additional data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data) {
        setSubscriptionData({
          subscribed: hasActiveSubscription || data.subscribed || false,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
        });
      } else {
        // Fall back to RevenueCat data only
        setSubscriptionData({
          subscribed: hasActiveSubscription,
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (!offerings || !offerings.availablePackages || offerings.availablePackages.length === 0) {
        alert('No subscription packages available. Please try again later.');
        return;
      }

      // Get the first available package
      const packageToPurchase = offerings.availablePackages[0];
      
      console.log('Purchasing package:', packageToPurchase);

      // Make the purchase
      const purchaseResult = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      const customerInfo = (purchaseResult as any).customerInfo;
      
      console.log('Purchase successful:', customerInfo);

      // Check if the user now has active entitlements
      const activeEntitlements = customerInfo?.entitlements?.active || {};
      if (Object.keys(activeEntitlements).length > 0) {
        console.log('Subscription activated successfully');
        await checkSubscription(); // Refresh subscription status
      } else {
        console.log('Purchase completed but no active entitlements found');
      }

    } catch (error: any) {
      console.error('Error during purchase:', error);
      
      // Handle specific RevenueCat errors
      if (error.code === 'PURCHASE_CANCELLED') {
        console.log('Purchase was cancelled by user');
        return;
      }
      
      alert(`Purchase failed: ${error.message || 'Unknown error'}`);
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('Purchases restored:', customerInfo);
      
      const activeEntitlements = (customerInfo as any).entitlements?.active || {};
      if (Object.keys(activeEntitlements).length > 0) {
        console.log('Active subscription found after restore');
        await checkSubscription();
      } else {
        alert('No active subscriptions found to restore.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      alert('Failed to restore purchases. Please try again.');
    }
  };

  const handleContinue = () => {
    navigate('/home');
  };

  const getPackageInfo = () => {
    if (!offerings || !offerings.availablePackages || offerings.availablePackages.length === 0) {
      return null;
    }
    
    const pkg = offerings.availablePackages[0];
    return {
      identifier: pkg.identifier,
      productId: pkg.storeProduct?.identifier || pkg.product?.identifier,
      price: pkg.storeProduct?.priceString || pkg.product?.priceString || 'N/A',
      period: pkg.storeProduct?.subscriptionPeriod || pkg.product?.subscriptionPeriod || ''
    };
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8">
          <div className="text-center">
            <p className="text-gray-500">Loading subscription details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const packageInfo = getPackageInfo();

  return (
    <Layout showLogoNavigation={false}>
      <div className="max-w-md mx-auto mt-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Premium Subscription</h1>
          <p className="text-gray-600">Unlock premium features and project sharing</p>
        </div>

        {subscriptionData.subscribed ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Crown className="h-5 w-5" />
                Premium Active
              </CardTitle>
              <CardDescription className="text-green-600">
                You have access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-green-700">
                <p><strong>Plan:</strong> {subscriptionData.subscription_tier || 'Premium Monthly'}</p>
                {subscriptionData.subscription_end && (
                  <p><strong>Next billing:</strong> {new Date(subscriptionData.subscription_end).toLocaleDateString()}</p>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Continue to App
                </Button>
                <Button
                  onClick={restorePurchases}
                  variant="outline"
                  className="w-full"
                >
                  Restore Purchases
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Managed through RevenueCat and App Store
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Features
              </CardTitle>
              <CardDescription>
                {packageInfo 
                  ? `${packageInfo.price} ${packageInfo.period}` 
                  : 'Monthly subscription via App Store'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Share projects with team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited vendor cards per project</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority customer support</span>
                </div>
              </div>
              
              {packageInfo && (
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                  <p><strong>Package:</strong> {packageInfo.identifier}</p>
                  <p><strong>Product:</strong> {packageInfo.productId}</p>
                  <p>Managed by RevenueCat and processed through Apple's App Store</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  onClick={handleSubscribe}
                  className="w-full bg-black text-white hover:bg-gray-800"
                  disabled={!packageInfo}
                >
                  {packageInfo 
                    ? `Subscribe for ${packageInfo.price}`
                    : 'Subscribe via App Store'
                  }
                </Button>
                <Button
                  onClick={restorePurchases}
                  variant="outline"
                  className="w-full"
                >
                  Restore Purchases
                </Button>
                <Button
                  onClick={handleContinue}
                  variant="outline"
                  className="w-full"
                >
                  Continue with Free Version
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Subscription will be charged through your App Store account
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Subscription;