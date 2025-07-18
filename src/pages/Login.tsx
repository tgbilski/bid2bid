import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Fields Required",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        // Increment sign-in count and get updated count
        const { data: countResult } = await supabase.rpc('increment_sign_in_count', {
          user_uuid: data.user.id
        });
        
        // Check subscription status
        const { data: subscriptionData } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

        // Smart routing: only show subscription page if not subscribed AND every 10th sign-in
        const isSubscribed = subscriptionData?.subscribed || false;
        const signInCount = countResult || 1;
        const shouldShowSubscription = !isSubscribed && (signInCount % 10 === 0);

        if (shouldShowSubscription) {
          navigate('/subscription');
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-black">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-black">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Forgot your password?
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
