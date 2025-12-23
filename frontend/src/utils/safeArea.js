import { Platform, StatusBar, Dimensions } from 'react-native';

export const getStatusBarHeight = () => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
};

export const getBottomSpace = () => {
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // Detect devices with gesture navigation (no physical buttons)
  // iPhone X and newer, and modern Android devices
  if (Platform.OS === 'ios') {
    return aspectRatio > 2 ? 34 : 0; // iPhone X+ has bottom notch
  }
  
  // Android gesture navigation detection
  return aspectRatio > 2 ? 20 : 0;
};

export const useSafeAreaInsets = () => {
  return {
    top: getStatusBarHeight(),
    bottom: getBottomSpace(),
    left: 0,
    right: 0
  };
};
