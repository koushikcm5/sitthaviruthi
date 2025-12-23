import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from '../../utils/safeArea';

export const SafeContainer = ({ children, style, edges = ['top', 'bottom'] }) => {
  const insets = useSafeAreaInsets();
  
  const paddingStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
  };

  return (
    <View style={[styles.container, paddingStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
