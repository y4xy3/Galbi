import React, { useEffect, useState } from 'react';
import Indicator from '@/components/Indicator';
import { LoggerStep, STEP_OPTIONS } from '@/components/Logger/config';
import MenuList from '@/components/MenuList';
import MenuListItem from '@/components/MenuListItem';
import { PageWithHeaderLayout } from '@/components/PageWithHeaderLayout';
import { t } from '@/helpers/translation';
import { BedDouble } from 'lucide-react-native';
import { ReactElement } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Bell, FileText, Heart, MessageSquare, Sun, Tag } from 'react-native-feather';
import { RootStackScreenProps } from '../../types';
import useColors from '../hooks/useColors';
import { useSettings } from '../hooks/useSettings';
import Purchases, { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';

const API_KEY = 'goog_BpyKiDExoUdGYxVfSwMNzyRGlsd';
const OFFERING_ID_yearly = 'yearlySubscription';
const offering_id_monthly = 'monthlySubs'
export const StepsScreen = ({ navigation }: RootStackScreenProps<'Steps'>) => {
  const colors = useColors();
  const { settings, setSettings } = useSettings();
  const [isPremium, setIsPremium] = useState(false);
  const [isSleepSwitchOn, setIsSleepSwitchOn] = useState(false);

  useEffect(() => {
    // Configure RevenueCat
    Purchases.setDebugLogsEnabled(true);
    Purchases.configure({ apiKey: API_KEY });

    // Check if user has purchased the premium offering
    const checkPremiumStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo.entitlements.active[OFFERING_ID_yearly] || customerInfo.entitlements.active[offering_id_monthly]  !== undefined) {
          setIsPremium(true);

        }
      } catch (e) {
        console.error("Failed to fetch customer info:", e);
      }
    };

    checkPremiumStatus();
  }, []);

  useEffect(() => {
    // Turn on sleep switch if user has purchased the premium offering
    if (isPremium) {
      setIsSleepSwitchOn(true);
    }
  }, [isPremium]);

  // const handlePurchase = async () => {
  //   try {
  //     const offerings = await Purchases.getOfferings();
  //     const currentOffering: PurchasesOffering | null = offerings.current;

  //     if (currentOffering && currentOffering.availablePackages.length > 0) {
  //       const purchasePackage: PurchasesPackage | undefined = currentOffering.availablePackages.find(pkg => pkg.identifier === OFFERING_ID);

  //       if (purchasePackage) {
  //         const purchaseInfo = await Purchases.purchasePackage(purchasePackage);
  //         if (purchaseInfo.customerInfo.entitlements.active[OFFERING_ID]) {
  //           setIsPremium(true);
  //           setSettings(settings => ({
  //             ...settings,
  //             steps: [...settings.steps, 'sleep'] as LoggerStep[]
  //           }));
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.error("Purchase failed:", e);
  //   }
  // };

  const handleSleepSwitch = () => {
    // console.log("Handling sleep switch");
    // console.log("isPremium:", isPremium);
    // console.log("isSleepSwitchOn:", isSleepSwitchOn);
    
    if (!isPremium) {
      console.log("User is not premium, redirecting to subscription slide");
      navigation.navigate('SubscriptionSlide');
    } else {
      console.log("User is premium, toggling sleep switch");
      setIsSleepSwitchOn(!isSleepSwitchOn);
      setSettings(settings => ({
        ...settings,
        steps: isSleepSwitchOn
          ? settings.steps.filter(s => s !== 'sleep')
          : [...settings.steps, 'sleep'] as LoggerStep[]
      }));
    }
  };
  

  const ICONS_MAP: { [key in LoggerStep]: ReactElement } = {
    'rating': <Sun width={20} height={20} stroke={colors.text} />,
    'message': <FileText width={20} height={20} color={colors.text} />,
    'sleep': <BedDouble size={20} color={colors.text} />,
    'tags': <Tag width={20} height={20} color={colors.text} />,
    'emotions': <Heart width={20} height={20} color={colors.text} />,
    'feedback': <MessageSquare width={20} height={20} color={colors.text} />,
    'reminder': <Bell width={20} height={20} color={colors.text} />,
  };

  return (
    <PageWithHeaderLayout style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ padding: 20, flex: 1 }}>
        <View style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 16, paddingRight: 16 }}>
          <Text style={{ fontSize: 17, color: colors.textSecondary }}>{t('steps_introduction')}</Text>
        </View>
        <MenuList style={{ marginTop: 16 }}>
          {STEP_OPTIONS.map((option) => (
            <MenuListItem
              key={option}
              title={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, color: colors.text }}>{t(`logger_step_${option}`)}</Text>
                  {option === 'sleep' && (
                    <Indicator colorName='purple' style={{ marginLeft: 8 }}>{t('premium')}</Indicator>
                  )}
                </View>
              }
              iconLeft={ICONS_MAP[option]}
              iconRight={option === 'rating' ? undefined : (
                <Switch
                  onValueChange={() => {
                    if (option === 'sleep') {
                      handleSleepSwitch();
                    } else {
                      setSettings(settings => ({
                        ...settings,
                        steps: settings.steps.includes(option)
                          ? settings.steps.filter(s => s !== option)
                          : [...settings.steps, option] as LoggerStep[]
                      }));
                    }
                  }}
                  value={settings.steps.includes(option) && (option !== 'sleep' || isPremium)}
                  // disabled={option === 'sleep' && !isPremium}
                />
              )}
              isLast={option === STEP_OPTIONS[STEP_OPTIONS.length - 1]}
            />
          ))}
        </MenuList>
      </ScrollView>
    </PageWithHeaderLayout>
  );
};
