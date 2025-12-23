import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authService = {
  async login(username, password, deviceInfo) {
    const response = await api.post('/auth/login', {
      username,
      password
    }, {
      headers: {
        'User-Agent': deviceInfo
      }
    });
    
    const { accessToken, refreshToken, ...userData } = response.data;
    
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    return response.data;
  },

  async refreshToken() {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    return accessToken;
  },

  async logout() {
    const username = JSON.parse(await AsyncStorage.getItem('userData')).username;
    await api.post('/auth/logout', { username });
    
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem('userData');
  },

  async getActiveSessions(username) {
    const response = await api.get(`/auth/sessions/${username}`);
    return response.data;
  },

  async logoutAllDevices(username) {
    await api.post(`/auth/logout-all/${username}`);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async getToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
};
