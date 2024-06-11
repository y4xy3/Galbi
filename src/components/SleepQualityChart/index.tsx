import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Polyline, G } from 'react-native-svg';
import useColors from '@/hooks/useColors';
import { SLEEP_QUALITY_KEYS } from '@/hooks/useLogs';
import { Grid } from './Grid';
import { XLabels } from './XLabels';
import { YLabels } from './YLabels';
import Purchases, { PurchasesPackage, PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';

const API_KEY = 'goog_BpyKiDExoUdGYxVfSwMNzyRGlsd';
const PRODUCT_ID = 'com.mindracer.galbi.yearly:yearly-subs1';

export const SleepQualityChart = ({ data, height, width, showAverage = false }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const colors = useColors();

  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        Purchases.setDebugLogsEnabled(true);
        Purchases.configure({ apiKey: API_KEY });

        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.all['yearlySubscription']);
        // console.log(offerings.all['nightChart'])

        const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
        const isActive = customerInfo.activeSubscriptions.includes(PRODUCT_ID);
        setIsUnlocked(isActive);
      } catch (error) {
        console.warn(error);
      }
    };

    configureRevenueCat();
  }, []);

  const handlePurchase = async () => {
    try {
      if (currentOffering && currentOffering.availablePackages.length > 0) {
        const packageToPurchase = currentOffering.availablePackages[0];
        // console.log(packageToPurchase)
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        const isActive = customerInfo.activeSubscriptions.includes(PRODUCT_ID);
        setIsUnlocked(isActive);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const paddingRight = 8;
  const paddingLeft = 8;
  const maxY = 4;
  const scaleItemCount = data.length;
  const scaleItems = data.map(d => ({
    ...d,
    value: d.value !== null ? Math.round(d.value) : null,
  }));

  const XLegendHeight = 32;
  const YLegendWidth = 32;
  const _height = Math.round(height / SLEEP_QUALITY_KEYS.length) * SLEEP_QUALITY_KEYS.length;
  const _width = width - YLegendWidth - paddingRight - paddingLeft;
  const rowHeight = Math.round(height / SLEEP_QUALITY_KEYS.length);
  const outerHeight = _height + XLegendHeight + rowHeight;
  const outerWidth = width;
  const itemWidth = _width / (scaleItemCount);

  const relativeY = (value: number) => Math.floor((_height - (value / maxY) * (_height)));
  const relativeX = (index: number) => Math.floor(index * itemWidth + itemWidth / 2) + YLegendWidth + paddingLeft;

  const polygonPoints = scaleItems.map((item, index) => {
    if (item.value === null) return null;
    const x = Math.round(relativeX(index));
    const y = Math.round(relativeY(item.value || 0)) + rowHeight / 2;
    return `${x},${y}`;
  }).filter(Boolean).join(' ');

  const nonNullItems = scaleItems.filter(item => item.value !== null);
  const average = nonNullItems.reduce((acc, item) => acc + item.value, 0) / nonNullItems.length;

  return (
    <View style={{ position: 'relative', width: '100%', height: outerHeight }}>
      {!isUnlocked && (
        <BlurView intensity={90} style={StyleSheet.absoluteFill}>
          <Svg width={'100%'} height={outerHeight} viewBox={`0 0 ${outerWidth} ${outerHeight}`}>
            <YLabels relativeY={relativeY} YLegendWidth={YLegendWidth} rowHeight={rowHeight} width={outerWidth} />
            <XLabels items={scaleItems} x={index => relativeX(index)} y={outerHeight - XLegendHeight / 2} />
            <Grid width={width} relativeY={relativeY} />
            <Polyline fill="none" stroke={colors.statisticsLinePrimary} strokeWidth="2" strokeLinejoin="round" points={polygonPoints} />
            {showAverage && <Line key={`avg-line`} x1={relativeX(0)} y1={relativeY(average)} x2={width - paddingRight} y2={relativeY(average)} stroke={colors.tint} strokeWidth={2} />}
          </Svg>
        </BlurView>
      )}
      <Svg width={'100%'} height={outerHeight} viewBox={`0 0 ${outerWidth} ${outerHeight}`} style={isUnlocked ? {} : styles.transparent}>
        <YLabels relativeY={relativeY} YLegendWidth={YLegendWidth} rowHeight={rowHeight} width={outerWidth} />
        <XLabels items={scaleItems} x={index => relativeX(index)} y={outerHeight - XLegendHeight / 2} />
        <Grid width={width} relativeY={relativeY} />
        <Polyline fill="none" stroke={colors.statisticsLinePrimary} strokeWidth="2" strokeLinejoin="round" points={polygonPoints} />
        {showAverage && <Line key={`avg-line`} x1={relativeX(0)} y1={relativeY(average)} x2={width - paddingRight} y2={relativeY(average)} stroke={colors.tint} strokeWidth={2} />}
      </Svg>
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Icon name="lock" size={50} color={'black'} />
          <Text style={styles.lockText}>This feature is locked.</Text>
          <TouchableOpacity style={styles.btn} onPress={handlePurchase}>
            <Text style={styles.btnText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  lockText: {
    fontSize: 16,
    marginVertical: 10,
  },
  transparent: {
    opacity: 10,
  },
});
