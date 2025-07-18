
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowLeft, Settings, LogOut, Trash2 } from 'lucide-react';
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

  const openAppStoreSettings = () => {
    // This will open the App Store subscription management
    console.log('Opening App Store subscription settings...');
    // TODO: Implement App Store settings navigation
  };

  const handleSubscribe = () => {
    // Navigate to subscription page for App Store purchase
    navigate('/subscription');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.\n\nIMPORTANT: If you have an active subscription, you must cancel it separately through your Apple ID settings before or after deleting your account.'
    );
    
    if (!confirmed) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Call the edge function to delete the user account
      const { error } = await supabase.functions.invoke('delete-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      
      // Sign out and redirect
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
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
        <div className="flex items-center justify-between gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
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
                  Managed through App Store
                </p>
              </div>
              
              {subscriptionData.subscription_end && (
                <p className="text-center text-green-700 text-sm">
                  Active until {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-2">
                <Button
                  onClick={openAppStoreSettings}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage in App Store
                </Button>
                <p className="text-xs text-center text-gray-600">
                  To cancel or modify your subscription, use your App Store settings
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
                <div className="text-3xl font-bold text-black mb-2">Free</div>
                <p className="text-sm text-gray-600">Basic features included</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleSubscribe}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Upgrade to Premium
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Subscription will be processed through App Store
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

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
            <p className="text-xs text-center text-gray-600 mt-2">
              This action cannot be undone. Active subscriptions must be cancelled separately through App Store.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManageSubscription;
