import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

export default function SplashScreen({ onFinish }) {
  const videoSource = require('../../../assets/img/Mobile Splash Video.mp4');
  const player = useVideoPlayer(videoSource, player => {
    player.play();
  });

  React.useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying }) => {
      if (!isPlaying && player.currentTime > 0) {
        onFinish();
      }
    });
    return () => subscription.remove();
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
