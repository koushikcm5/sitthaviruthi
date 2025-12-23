import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialIcons } from '@expo/vector-icons';

const extractYouTubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function UniversalVideoPlayer({ videoUrl, onClose }) {
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeId, setYoutubeId] = useState(null);
  const player = useVideoPlayer(videoUrl, player => {
    if (!isYouTube) {
      player.play();
    }
  });

  useEffect(() => {
    const ytId = extractYouTubeId(videoUrl);
    if (ytId) {
      setIsYouTube(true);
      setYoutubeId(ytId);
    }
    
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
      if (player) {
        try {
          player.release();
        } catch (error) {
          console.log('Player cleanup error:', error);
        }
      }
    };
  }, [videoUrl]);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {isYouTube && youtubeId ? (
          <WebView
            style={styles.video}
            source={{ uri: `https://www.youtube.com/embed/${youtubeId}?autoplay=1` }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          !isYouTube && <VideoView player={player} style={styles.video} nativeControls />
        )}
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
