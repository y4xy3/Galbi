import { NavigationContainer, useNavigation, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Pressable, useColorScheme } from 'react-native';
import { ArrowLeft, Flag, Settings as SettingsIcon } from 'react-native-feather';
import useColors from '../hooks/useColors';
import useFeedbackModal from '../hooks/useFeedbackModal';
import { useTranslation } from '../hooks/useTranslation';
import Calendar from '../screens/Calendar';
import Licenses from '../screens/Licenses';
import Reminder from '../screens/Reminder';
import Log from '../screens/Log';
import NotFound from '../screens/NotFound';
import Scales from '../screens/Scales';
import Settings from '../screens/Settings';
import Privacy from '../screens/Privacy';
import Data from '../screens/Data';
import Webhook from '../screens/Webhook';
import WebhookHistoryEntry from '../screens/WebhookHistoryEntry';
import { RootStackParamList } from '../types';
import * as Haptics from 'expo-haptics';
import { useSegment } from "../hooks/useSegment";
import Colors from '../constants/Colors';

const linking = {
  prefixes: ['pixy://'],
  config: {
    screens: {
      Webhook: {
        path: 'webhook',
        screens: {
          WebhookHistoryEntry: {
            path: 'webhook/history/:date',
          },
        },
      }
    },
  },
};

export default function Navigation() {
  const scheme = useColorScheme();
  
  return (
    <NavigationContainer 
      linking={linking}
      theme={scheme === 'dark' ? { 
        dark: true,
        colors: {
          ...Colors.dark,
        }
      } : {
        dark: false,
        colors: {
          ...Colors.light,
        }
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const BackButton = ({ 
  testID,
}: { 
  testID?: string,
}) => {
  const navigation = useNavigation()
  const colors = useColors()
  
  return (
    <Pressable
      style={{
        padding: 15,
        marginLeft: 5,
      }}
      onPress={() => navigation.goBack()}
      testID={testID}
    >
      <ArrowLeft width={24} color={colors.text} />
    </Pressable>
  );
}

function RootNavigator() {
  const colors = useColors();
  const i18n = useTranslation()

  const segment = useSegment()
  segment.initialize()

  const defaultOptions = {
    headerTintColor: colors.text,
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerShadowVisible: Platform.OS !== 'web',
  }
  const { show: showFeedbackModal, Modal } = useFeedbackModal();

  return (
    <>
    <Modal />
    <Stack.Navigator
      initialRouteName="Calendar"
      screenListeners={{
        state: (e) => {
          segment.screen(e.data.state.routes[e.data.state.routes.length - 1].name)
        },
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={Calendar}
        options={({ navigation }) => ({
          ...defaultOptions,
          title: i18n.t('calendar'),
          headerRight: () => (
            <Pressable
              testID='settings'
              onPress={async () => {
                await Haptics.selectionAsync()
                navigation.navigate('Settings')
              }}
              style={{
                padding: 15,
                paddingTop: 10,
              }}
              accessible={true}
              accessibilityLabel={i18n.t('settings')}
              accessibilityRole={'button'}
            >
              <SettingsIcon height={22} color={colors.text} />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable
              testID='feedback'
              onPress={async () => {
                await Haptics.selectionAsync()
                showFeedbackModal({ type: 'issue' })
              }}
              style={{
                padding: 15,
                paddingTop: 10,
              }}
              accessible={true}
              accessibilityLabel={i18n.t('feedback')}
              accessibilityRole={'button'}
            >
              <Flag height={22} color={colors.text} />
            </Pressable>
          )
        })}
      />

      <Stack.Screen name="NotFound" component={NotFound} options={{ title: 'Oops!' }} />
      
      <Stack.Group screenOptions={{ 
        title: '',
        presentation: 'modal',
        headerShown: false,
      }}>
        <Stack.Screen 
          name="Log" 
          component={Log} 
        />
      </Stack.Group>
      
      <Stack.Group
        screenOptions={{ 
          ...defaultOptions,
        }} 
      >
        <Stack.Screen 
          name="Settings" 
          component={Settings} 
          options={{ 
            title: i18n.t('settings'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'settings-back-button'} />,
          }}
        />
        <Stack.Screen 
          name="Reminder" 
          component={Reminder}
          options={{ 
            title: i18n.t('reminder'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'reminder-back-button'} />,
          }}
        />
        <Stack.Screen 
          name="Privacy" 
          component={Privacy}
          options={{ 
            title: i18n.t('privacy'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'privacy-back-button'} />,
          }}
        />
        <Stack.Screen
          name="Webhook" 
          component={Webhook} 
          options={{ 
            title: i18n.t('webhook'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'webhook-back-button'} />,
          }} 
        />
        <Stack.Screen 
          name="WebhookHistoryEntry" 
          component={WebhookHistoryEntry} 
          options={{ 
            title: '',
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'webhook-history-entry-back-button'} />,
          }} 
        />
        <Stack.Screen 
          name="Licenses" 
          component={Licenses} 
          options={{ 
            title: i18n.t('licenses'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'licenses-back-button'} />,
          }} 
        />
        <Stack.Screen 
          name="Scales" 
          component={Scales} 
          options={{ 
            title: i18n.t('scales'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'scales-back-button'} />,
          }} 
        />
        <Stack.Screen 
          name="Data" 
          component={Data} 
          options={{ 
            title: i18n.t('data'),
            headerLeft: () => Platform.OS === 'ios' ? null : <BackButton testID={'data-back-button'} />,
          }} 
        />
      </Stack.Group>
    </Stack.Navigator>
    </>
  );
}
