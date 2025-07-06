
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface PurchaseOption {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
}

const purchaseOptions: PurchaseOption[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for small projects',
    price: '$4.99',
    features: ['Up to 5 projects', 'Up to 10 vendors per project', 'Basic comparison tools']
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'Best for contractors and businesses',
    price: '$9.99',
    features: ['Unlimited projects', 'Unlimited vendors', 'Advanced analytics', 'Export to PDF', 'Priority support']
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Enterprise solution',
    price: '$19.99',
    features: ['Everything in Pro', 'Team collaboration', 'Custom branding', 'API access', 'Dedicated support']
  }
];

const InAppPurchase = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setLoading(planId);
    
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Purchase Successful!",
        description: `You've successfully subscribed to the ${purchaseOptions.find(p => p.id === planId)?.name}.`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Upgrade to unlock more features and capabilities</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {purchaseOptions.map((option) => (
          <Card key={option.id} className="relative">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{option.name}</CardTitle>
              <p className="text-gray-600">{option.description}</p>
              <div className="text-3xl font-bold text-black">{option.price}</div>
              <p className="text-sm text-gray-500">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePurchase(option.id)}
                disabled={loading === option.id}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {loading === option.id ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default InAppPurchase;
