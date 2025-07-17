import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const ManageSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  // Simulate subscription check (update as needed)
  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // In a real app, you might check your own backend
      // Here, we'll mock the response for demonstration
      // Replace this with your own logic if you fetch real Apple status
      // Example: call your API to verify Apple receipt, get subscription status
      setSubscriptionData({
        subscribed: false, // Set appropriately based on your backend
        subscription_tier: undefined,
        subscription_end: undefined,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Instead of direct purchase/cancel, present instructions
  const openAppleManageUrl = () => {
    // This is Apple's manage subscriptions URL, opens in new tab
    window.open('https://apps.apple.com/account/subscriptions', '_blank');
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8">
          <BackButton />
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
      <div className="max-w-2xl mx-auto mt-8">
        <BackButton />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Manage Subscription</h1>
          <p className="text-gray-600">View and manage your subscription plan</p>
        </div>

        <div className="space-y-6">
          {/* Current Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                {subscriptionData.subscribed ? (
                  <>
                    <Crown size={20} className="mr-2 text-yellow-500" />
                    Premium Plan
                  </>
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2 text-gray-500" />
                    Free Plan
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {subscriptionData.subscribed ? 'You have access to all premium features' : 'Limited features available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-2xl font-bold">
                    {subscriptionData.subscribed ? '$2.99' : '$0'}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {subscriptionData.subscribed && subscriptionData.subscription_end && (
                  <p className="text-sm text-gray-600 text-center">
                    Active until {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={openAppleManageUrl}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    {subscriptionData.subscribed
                      ? 'Manage on Apple App Store'
                      : 'Subscribe on Apple App Store'}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {subscriptionData.subscribed
                      ? 'To manage or cancel your subscription, use your Apple device or Apple ID account page.'
                      : 'Subscriptions are handled via the Apple App Store. Tap above to manage.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Comparison */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Unlimited projects</span>
                  <span className*

