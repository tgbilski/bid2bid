
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Subscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
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
    setIsCheckingOut(true);
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
      setIsCheckingOut(false);
    }
  };

  const handleContinue = () => {
    navigate('/home');
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">Select the plan that works best for you</p>
        </div>

        <div className="space-y-4">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Free</CardTitle>
              <CardDescription>Perfect for personal use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-2xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  Compare vendor pricing by yourself
                </li>
                <li className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  Unlimited projects
                </li>
                <li className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  Up to 10 vendors per project
                </li>
              </ul>
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full rounded-[10px]"
                disabled={subscriptionData.subscribed}
              >
                {subscriptionData.subscribed ? 'Current Plan' : 'Continue with Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`border-2 ${subscriptionData.subscribed ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-lg">
                <Crown size={20} className="mr-2 text-yellow-500" />
                Premium
              </CardTitle>
              <CardDescription>Share projects with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-2xl font-bold">$2.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  Everything in Free
                </li>
                <li className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  <strong>Share projects with others</strong>
                </li>
                <li className="flex items-center">
                  <Check size={16} className="mr-2 text-green-500" />
                  Collaborative bidding
                </li>
              </ul>
              {subscriptionData.subscribed ? (
                <div className="text-center">
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px]"
                  >
                    Continue to App
                  </Button>
                  {subscriptionData.subscription_end && (
                    <p className="text-sm text-gray-500 mt-2">
                      Active until {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={isCheckingOut}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px]"
                >
                  {isCheckingOut ? 'Processing...' : 'Upgrade to Premium'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
