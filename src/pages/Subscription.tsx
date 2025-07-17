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

  // Simulate subscription check. Replace with your backend Apple receipt check if needed.
  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Replace with your backend logic if you validate Apple subscriptions server-side
      setSubscriptionData({
        subscribed: false, // Or set based on your real subscription data
        subscription_tier: undefined,
        subscription_end: undefined,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAppleManageUrl = () => {
    window.open('https://apps.apple.com/account/subscriptions', '_blank');
  };

  const handleContinue = () => {
    navigate('/home');
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto

