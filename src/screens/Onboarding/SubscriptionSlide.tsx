import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import Icon from 'react-native-vector-icons/MaterialIcons';  // Importing the icon library
import useColors from '../../hooks/useColors';
import { useNavigation } from '@react-navigation/native';  // Import navigation
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSettings } from '../../hooks/useSettings';
type SubscriptionSlideProps = {
  onFinish: () => void;
};

const SubscriptionSlide: React.FC<SubscriptionSlideProps> = ({ onFinish }) => {
  const [isTrialEnabled, setIsTrialEnabled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const navigation = useNavigation();  // Initialize navigation
  const { addActionDone } = useSettings();
  const analytics = useAnalytics();


  const colors = useColors();
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const init = async () => {
      await Purchases.configure({ apiKey: 'goog_BpyKiDExoUdGYxVfSwMNzyRGlsd' });
    };
    init();
  }, []);

  const handleStartTrial = async () => {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      await AsyncStorage.setItem('trialEndDate', trialEndDate.toISOString());

      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        let packageToPurchase;
        if (selectedPlan === 'yearly') {
          packageToPurchase = offerings.all['yearlySubscription'].availablePackages[0];
          console.log(packageToPurchase)
         } else if (selectedPlan === 'monthly') {
          packageToPurchase = offerings.all['monthlySubs'].availablePackages[0];
        }
        if (packageToPurchase) {
          const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
          if (purchaseResult.customerInfo.entitlements.active['monthlySubs'] || purchaseResult.customerInfo.entitlements.active['yearlySubscription']) {
            onFinish();
          }
        }
      }
    } catch (error) {
      if (!error.userCancelled) {
        console.error('Error during purchase: ', error);
      }
    }
  };

  const handlePlanPress = (plan: string) => {
    setSelectedPlan(plan);
  };

  const  handleClose = async () => {
    await addActionDone('onboarding');
    // navigation.popToTop();
    analytics.track('onboarding_finished');
    navigation.navigate('Calendar');  // Navigate to the calendar screen
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.onboardingBottomBackground }]}>
      
      <TouchableOpacity onPress={handleClose} style={styles.iconClose}>
        <Icon name="close" size={30} color="white" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Choose your plan</Text>
      <Text style={styles.rating}>⭐⭐⭐⭐⭐</Text>
      <Text style={styles.quote}>
        "It's like having a personal therapist in my pocket. The mood tracking and journaling features have made a big difference in how I manage my emotions. This app is a must-have for anyone serious about mental health"
      </Text>
      <Text style={styles.author}>Samantha K</Text>
      <View
        style={[
          styles.trialContainer,
          styles.switchContainer,
          { backgroundColor: isTrialEnabled ? '#D8BFD8' : '#A9A9A9', width: width - 32 },
        ]}
      >
        <Text style={styles.trialText}>
          {isTrialEnabled ? 'Free trial enabled' : 'Not sure yet? Enable free trial.'}
        </Text>
        <Switch
          value={isTrialEnabled}
          onValueChange={setIsTrialEnabled}
          trackColor={{ false: '#767577', true: '#8e44ad' }}
          thumbColor={isTrialEnabled ? '#f5dd4b' : '#f4f3f4'}
          style={styles.switch}
        />
      </View>

      <TouchableOpacity
        onPress={() => handlePlanPress('yearly')}
        style={[
          styles.planContainer,
          styles.yearlyPlan,
          selectedPlan === 'yearly' && styles.selectedPlan,
        ]}
      >
        <View style={[styles.header]}>
          <Text style={styles.planText}>MOST POPULAR</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.planDetailsContainer}>
            <Text style={styles.planName}>Yearly</Text>
            <Text style={styles.planDetails}>12 mo . $50</Text>
          </View>
          <Text style={styles.planPrice}> $4.17 / mo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePlanPress('monthly')}
        style={[
          styles.contain,
          styles.friendsPlan,
          selectedPlan === 'monthly' && styles.selectedPlan,
        ]}
      >
        <View style={styles.planDetailsRow}>
          <View style={styles.planDetailsContainer}>
            <Text style={styles.planName}>Monthly</Text>
             {/* <Text style={styles.planDetails}>12 mo . $19.99</Text> */}
          </View>
          <Text style={styles.planPrice}>$7.99 / mo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.startTrialButton, { backgroundColor:'#841584' }]}
        onPress={isTrialEnabled ? handleStartTrial : handleStartTrial}
        // disabled={!isTrialEnabled}
      >
        <Text style={styles.startTrialButtonText}>{!isTrialEnabled?"Continue":"Start 7-Day Free Trial"}</Text>
      </TouchableOpacity>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  iconClose:{
    position: 'absolute',
    top: 46,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  rating: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  author: {
    fontSize: 14,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  trialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  trialText: {
    fontSize: 16,
    color: 'black',
  },
  switchContainer: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    padding: 10,
  },
  switch: {
    marginLeft: 'auto',
  },
  contain:{
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
  },
  planContainer: {
    width: '100%',
    // padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
  },
  yearlyPlan: {
    backgroundColor: 'white',
    borderColor: '#333333',
    borderRadius: 10,
  },
  friendsPlan: {
    backgroundColor: 'white',
  },
  planText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  planDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  row:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    margin: 10,
    padding: 10
  },

  planDetailsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  planName: {
    fontSize: 18,
    color: '#444444',
    fontWeight: 'bold',
  },
  planDetails: {
    fontSize: 14,
    color: '#444444',
  },
  planPrice: {
    fontSize: 14,
    color: '#444444',
  },
  startTrialButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  startTrialButtonText: {
    fontSize: 16,
    color: 'white',
  },
  viewPlans: {
    marginTop: 16,
  },
  viewPlansText: {
    fontSize: 16,
    color: '#007aff',
  },
  header: {
    backgroundColor: 'gray',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,

  },
  selectedPlan: {
    backgroundColor: '#ADDFFF',
    opacity: 0.8,
    borderRadius: 10,
    borderColor: 'blue'
  },
});

export default SubscriptionSlide;
