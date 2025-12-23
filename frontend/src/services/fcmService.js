import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import api from './api';

export const fcmService = {
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  },

  async getToken() {
    return await messaging().getToken();
  },

  async registerDeviceToken(username) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const token = await this.getToken();
    await api.post('/notifications/device-token', {
      username,
      token,
      deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID'
    });
  },

  onMessage(callback) {
    return messaging().onMessage(callback);
  },

  onNotificationOpenedApp(callback) {
    messaging().onNotificationOpenedApp(callback);
  },

  async getInitialNotification() {
    return await messaging().getInitialNotification();
  }
};
