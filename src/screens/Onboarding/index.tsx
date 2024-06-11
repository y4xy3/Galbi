import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useColors from '../../hooks/useColors';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSettings } from '../../hooks/useSettings';
import { RootStackScreenProps } from '../../../types';
import { ExplainerSlide } from './ExplainerSlide';
import { IndexSlide } from './IndexSlide';
import { PrivacySlide } from './PrivacySlide';
import { ReminderSlide } from './ReminderSlide';
import SubscriptionSlide from './SubscriptionSlide';
import WelcomeSlide from './WelcomeSlide';

type SlideProps = {
  index: number;
  setIndex: (index: number) => void;
  onSkip: () => void;
};

const CalendarSlide = (props: SlideProps) => <ExplainerSlide {...props} />;
const StatisticsSlide = (props: SlideProps) => <ExplainerSlide {...props} />;
const FiltersSlide = (props: SlideProps) => <ExplainerSlide {...props} />;

export const Onboarding = ({ navigation, route }: RootStackScreenProps<'Onboarding'>) => {
  const { addActionDone } = useSettings();
  const colors = useColors();
  const analytics = useAnalytics();
  const insets = useSafeAreaInsets();
  const [index, _setIndex] = useState(0);

  const setIndex = (newIndex: number) => {
    console.log(`Navigating to slide index: ${newIndex}`);
    _setIndex(newIndex);
    analytics.track('onboarding_slide', { index: newIndex });
  };

  const finish = async () => {
    await addActionDone('onboarding');
    navigation.popToTop();
    analytics.track('onboarding_finished');
  };

  const skip = async () => {
    await addActionDone('onboarding');
    navigation.popToTop();
    analytics.track('onboarding_skipped', { index });
  };

  const slides = [
    <WelcomeSlide key={0} onStart={() => setIndex(1)} />,
    <CalendarSlide key={1} index={1} setIndex={setIndex} onSkip={skip} />,
    <StatisticsSlide key={2} index={2} setIndex={setIndex} onSkip={skip} />,
    <FiltersSlide key={3} index={3} setIndex={setIndex} onSkip={skip} />,
    <ReminderSlide key={4} index={4} setIndex={setIndex} onSkip={skip} />,
    <PrivacySlide key={5} onPress={() => setIndex(6)} />,
    <SubscriptionSlide
      key={6}
      onFinish={finish}
    />,
  ];

  console.log(`Current slide index: ${index}`);

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.onboardingBottomBackground,
      paddingBottom: insets.bottom,
    }}>
      {slides[index]}
    </View>
  );
};
