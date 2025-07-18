
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

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

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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

  const openCustomerPortal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  const createCheckout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
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
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Manage Subscription</h1>
          <p className="text-gray-600">View and manage your subscription plan</p>
        </div>

        {subscriptionData.subscribed ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Crown className="h-5 w-5" />
                Premium Plan
              </CardTitle>
              <CardDescription className="text-green-600">
                You have access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-800 mb-2">
                  Active Subscription
                </div>
                <p className="text-sm text-green-600">
                  Billing managed through your platform's app store
                </p>
              </div>
              
              {subscriptionData.subscription_end && (
                <p className="text-center text-green-700 text-sm">
                  Active until {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-2">
                <Button
                  onClick={openCustomerPortal}
                  variant="outline"
                  className="w-full"
                >
                  Manage Subscription
                </Button>
                <p className="text-xs text-center text-gray-600">
                  To manage or cancel your subscription, use your platform's app store settings
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Free Plan
              </CardTitle>
              <CardDescription>
                Limited features available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">$0</div>
                <p className="text-sm text-gray-600">/month</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={createCheckout}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Upgrade to Premium
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Subscriptions are handled via your platform's app store
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm">Unlimited projects</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm">Up to 10 vendors per project</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={subscriptionData.subscribed ? "text-green-600" : "text-red-500"}>
                {subscriptionData.subscribed ? '✓' : '✗'}
              </span>
              <span className="text-sm">Project sharing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={subscriptionData.subscribed ? "text-green-600" : "text-red-500"}>
                {subscriptionData.subscribed ? '✓' : '✗'}
              </span>
              <span className="text-sm">Collaborative bidding</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManageSubscription;
