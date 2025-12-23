import React, { useEffect, useState } from 'react';
import { Linking, View, StatusBar, Platform, AppState } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { API_URL } from './config';
// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import SplashScreen from './src/screens/auth/SplashScreen';

// User Screens
import ChemsingDashboard from './src/screens/user/ChemsingDashboard';
// Removed unused dashboard imports
import RoutineDetailScreen from './src/screens/user/RoutineDetailScreen';
import NotificationsScreen from './src/screens/user/NotificationsScreen';

// Admin Screens
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminContentManager from './src/screens/admin/AdminContentManager';
import AdminNotificationsScreen from './src/screens/admin/AdminNotificationsScreen';

// Legal Screens
import PrivacyPolicyScreen from './src/screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/legal/TermsOfServiceScreen';
import AboutScreen from './src/screens/AboutScreen';

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = React.useRef();
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const appState = React.useRef(AppState.currentState);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'JosefinSans-Regular': require('./assets/fonts/josefin/JosefinSans-Regular.ttf'),
          'JosefinSans-Medium': require('./assets/fonts/josefin/JosefinSans-Medium.ttf'),
          'JosefinSans-Bold': require('./assets/fonts/josefin/JosefinSans-Bold.ttf'),
          'WorkSans-Regular': require('./assets/fonts/work_sans/WorkSans-Regular.ttf'),
          'WorkSans-Medium': require('./assets/fonts/work_sans/WorkSans-Medium.ttf'),
          'WorkSans-Bold': require('./assets/fonts/work_sans/WorkSans-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  const notifyAppOpen = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_URL}/app/open`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.log('App open notification error:', error);
    }
  };

  useEffect(() => {
    // const preventScreenCapture = async () => {
    //   await ScreenCapture.preventScreenCaptureAsync();
    // };
    // preventScreenCapture();

    // Notify backend when app opens
    notifyAppOpen();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        notifyAppOpen();
      }
      appState.current = nextAppState;
    });

    return () => {
      // ScreenCapture.allowScreenCaptureAsync();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url && url.includes('reset-password')) {
        const token = url.split('token=')[1];
        if (token && navigationRef.current) {
          navigationRef.current.navigate('ResetPassword', { token });
        }
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  if (showSplash || !fontsLoaded) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          {/* Removed unused dashboard screens */}
          <Stack.Screen name="ChemsingDashboard" component={ChemsingDashboard} />
          <Stack.Screen name="AdminContentManager" component={AdminContentManager} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
