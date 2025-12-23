import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialIcons } from '@expo/vector-icons';

export default function SecureVideoPlayer({ videoUrl, onClose }) {
  const player = useVideoPlayer(videoUrl, player => {
    player.play();
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
      player.release();
    };
  }, []);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls
        />
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <MaterialIcons name="close" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    padding: 8,
    zIndex: 999,
  },
});
