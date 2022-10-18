import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar as CalendarIcon, PieChart, Settings as SettingsIcon } from 'react-native-feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useColors from '../hooks/useColors';
import useHaptics from '../hooks/useHaptics';
import { useTranslation } from '../hooks/useTranslation';
import { SettingsScreen, StatisticsScreen } from '../screens';
import CalendarScreen from '../screens/Calendar';

export const ROUTES = [
  {
    name: 'Statistics',
    component: StatisticsScreen,
    icon: PieChart,
    path: 'statistics',
  },
  {
    name: 'Calendar',
    component: CalendarScreen,
    icon: CalendarIcon,
    path: 'calendar',
  },
  {
    name: 'Settings',
    component: SettingsScreen,
    icon: SettingsIcon,
    path: 'settings',
  }
];


export function MyTabBar({ state, descriptors, navigation }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: insets.bottom,
        borderTopColor: colors.headerBorder,
        borderTopWidth: 1,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const Icon = ROUTES.find(r => r.name === route.name)?.icon;

        const accessibilityState = useMemo(() => ({
          selected: isFocused,
        }), [isFocused]);

        const _onPress = useCallback(async () => {
          await haptics.selection();
          onPress?.();
        }, [onPress, haptics]);

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={_onPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: isFocused ? colors.tabsTextActive : 'transparent',
                width: '50%',
                height: 2,
                marginTop: -1,
                marginBottom: 4,
              }} />
            <Icon width={20} color={isFocused ? colors.tabsIconActive : colors.tabsIconInactive} />
            <Text
              style={{
                color: isFocused ? colors.tabsTextActive : colors.tabsTextInactive,
                fontSize: 12,
                fontWeight: '700',
                marginTop: 2,
                marginBottom: 4,
              }}
            >{t(label.toLowerCase())}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
