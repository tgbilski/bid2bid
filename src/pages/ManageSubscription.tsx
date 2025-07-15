
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CreditCard, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  stripe_customer_id?: string;
}

const ManageSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
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

      if (error) {
        console.error('Error checking subscription:', error);
      } else if (data) {
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Note: This would typically call a Stripe API to cancel the subscription
      // For now, we'll just show a message
      toast({
        title: "Subscription Cancellation",
        description: "To cancel your subscription, please contact support or manage it through your Stripe customer portal.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
                  {subscriptionData.subscribed ? (
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isProcessing}
                      variant="destructive"
                      className="w-full"
                    >
                      {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpgrade}
                      disabled={isProcessing}
                      className="w-full bg-black text-white hover:bg-gray-800"
                    >
                      {isProcessing ? 'Processing...' : 'Upgrade to Premium'}
                    </Button>
                  )}
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
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Up to 10 vendors per project</span>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Project sharing</span>
                  <span className={subscriptionData.subscribed ? 'text-green-500' : 'text-red-500'}>
                    {subscriptionData.subscribed ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Collaborative bidding</span>
                  <span className={subscriptionData.subscribed ? 'text-green-500' : 'text-red-500'}>
                    {subscriptionData.subscribed ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ManageSubscription;
