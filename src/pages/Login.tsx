
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate magic link email sending
    setTimeout(() => {
      const magicLink = `mailto:${email}?subject=Bid2Bid Magic Link&body=Click here to login to Bid2Bid: https://bid2bid.app/auth/verify?token=magic-token-${Date.now()}`;
      window.location.href = magicLink;
      
      toast({
        title: "Magic Link Sent!",
        description: "Check your email and click the magic link to log in.",
      });
      
      // For demo purposes, automatically navigate after 3 seconds
      setTimeout(() => {
        navigate('/home');
      }, 3000);
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Welcome to Bid2Bid</h1>
          <p className="text-gray-600">Enter your email to receive a magic link</p>
        </div>

        <div className="space-y-4">
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
            />
          </div>

          <Button
            onClick={handleMagicLink}
            disabled={isLoading}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
          >
            {isLoading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
