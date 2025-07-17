import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as RNIap from 'react-native-iap';

// Replace below with your real App Store Connect product ID for the subscription, NOT an Apple ID!
const productIds = ['io.bid2bid.app.premium.monthly']; // Use your correct product ID here

const ManageSubscription = ({ navigation }) => {
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | undefined>(undefined);

  useEffect(() => {
    RNIap.initConnection().then(() => {
      fetchProducts();
      checkSubscription();
    });
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const items = await RNIap.getSubscriptions(productIds);
      setProducts(items);
    } catch (err) {
      Alert.alert('Error', 'Could not load products');
    }
    setIsLoading(false);
  };

  const checkSubscription = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const activeSub = purchases.find(p => productIds.includes(p.productId));
      setIsSubscribed(!!activeSub);
      if (activeSub && activeSub.transactionDate) {
        // Demo: Set a dummy expiration 30 days after purchase (replace with backend validation for production)
        const ms = Number(activeSub.transactionDate) + 30 * 24 * 60 * 60 * 1000;
        setSubscriptionEnd(new Date(ms).toLocaleDateString());
      }
    } catch (err) {
      // Ignore, just means no subscription
    }
  };

  const handleSubscribe = async (productId: string) => {
    setIsProcessing(true);
    try {
      await RNIap.requestSubscription(productId);
      await checkSubscription();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Purchase failed');
    }
    setIsProcessing(false);
  };

  const handleManage = () => {
    RNIap.deepLinkToSubscriptions();
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <Button title="Back" onPress={() => navigation.goBack()} />
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Manage Subscription</Text>
        <Text style={{ color: '#555' }}>View and manage your subscription plan</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
          {isSubscribed ? 'Premium Plan' : 'Free Plan'}
        </Text>
        <Text style={{ color: '#888' }}>
          {isSubscribed ? 'You have access to all premium features' : 'Limited features available'}
        </Text>
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold' }}>
            {isSubscribed ? (products[0]?.localizedPrice ?? '$2.99') : '$0'}
          </Text>
          <Text style={{ color: '#888' }}>/month</Text>
        </View>
        {isSubscribed && subscriptionEnd && (
          <Text style={{ textAlign: 'center', color: '#999' }}>
            Active until {subscriptionEnd}
          </Text>
        )}
        <View style={{ marginTop: 16 }}>
          {isSubscribed ? (
            <Button title="Manage on Apple App Store" onPress={handleManage} />
          ) : (
            <Button
              title={isProcessing ? 'Processing...' : 'Upgrade to Premium'}
              onPress={() => handleSubscribe(products[0]?.productId)}
              disabled={isProcessing || !products.length}
            />
          )}
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#888', marginTop: 8 }}>
            {isSubscribed
              ? 'To manage or cancel your subscription, tap above to open your Apple subscriptions.'
              : 'Subscriptions are handled via the Apple App Store.'}
          </Text>
        </View>
      </View>

      {/* Features Comparison */}
      <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Plan Features</Text>
        <Text>✓ Unlimited projects</Text>
        <Text>✓ Up to 10 vendors per project</Text>
        <Text>
          {isSubscribed ? '✓' : '✗'} Project sharing
        </Text>
        <Text>
          {isSubscribed ? '✓' : '✗'} Collaborative bidding
        </Text>
      </View>
    </ScrollView>
  );
};

export default ManageSubscription;
