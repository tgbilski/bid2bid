
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Subscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // App Store product ID
  const APP_STORE_PRODUCT_ID = 'io.bid2bid.app.premium.monthly';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    await checkSubscription();
  };

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check subscription status from your backend
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data) {
        setSubscriptionData({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    // This will trigger the App Store subscription flow for the specific product ID
    console.log(`Triggering App Store subscription for product: ${APP_STORE_PRODUCT_ID}`);
    
    // In a Capacitor app, you would use the In-App Purchase plugin here
    // For now, this will redirect to App Store subscription management
    // When implementing with Capacitor, you'll use:
    // await Capacitor.Plugins.InAppPurchase2.order(APP_STORE_PRODUCT_ID);
    
    // For web testing, we'll just log the product ID
    alert(`Subscription would be triggered for product: ${APP_STORE_PRODUCT_ID}`);
  };

  const handleContinue = () => {
    navigate('/home');
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
                <p><strong>Product ID:</strong> {APP_STORE_PRODUCT_ID}</p>
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
                <p className="text-xs text-center text-gray-600">
                  To manage your subscription, go to your App Store settings
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
                Monthly subscription via App Store
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
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Product ID:</strong> {APP_STORE_PRODUCT_ID}</p>
                <p>This subscription will be processed through Apple's App Store using the product ID configured in App Store Connect.</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleSubscribe}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Subscribe via App Store
                </Button>
                <Button
                  onClick={handleContinue}
                  variant="outline"
                  className="w-full"
                >
                  Continue with Free Version
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Subscription will be charged through your App Store account at the price set for your region
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
