import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as RNIap from 'react-native-iap';

const productIds = ['io.bid2bid.app.premium.monthly']; // Your App Store subscription product ID

const Subscription = ({ navigation }) => {
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
        // For demo: fake expiration 30 days after purchase
        const ms = Number(activeSub.transactionDate) + 30 * 24 * 60 * 60 * 1000;
        setSubscriptionEnd(new Date(ms).toLocaleDateString());
      }
    } catch (err) {
      // No subscription found
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

  const handleContinue = () => {
    navigation.navigate('Home');
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
   *

