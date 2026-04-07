import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, StatusBar, SafeAreaView, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const extractYouTubeId = (url) => {
  if (!url) return null;
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
  
  const player = useVideoPlayer(videoUrl, p => {
    if (!isYouTube && p) {
      p.play();
      p.loop = false;
    }
  });

  useEffect(() => {
    const ytId = extractYouTubeId(videoUrl);
    if (ytId) {
      setIsYouTube(true);
      setYoutubeId(ytId);
    } else {
      setIsYouTube(false);
    }

    // Allow rotation but stay portrait by default for better fit on phones
    ScreenOrientation.unlockAsync();
    
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      if (player) {
        try {
          player.pause();
        } catch (error) {
          console.log('Player pause error:', error);
        }
      }
    };
  }, [videoUrl]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Main Video Container centered on screen */}
        <View style={styles.videoWrapper}>
          {isYouTube && youtubeId ? (
            <WebView
              style={styles.video}
              source={{ uri: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1` }}
              allowsFullscreenVideo
              scrollEnabled={false}
              mediaPlaybackRequiresUserAction={false}
            />
          ) : (
            <VideoView 
              player={player} 
              style={styles.video} 
              contentFit="contain" 
              nativeControls 
              allowsFullscreen
            />
          )}
        </View>

        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#04223e', // Deep premium dark blue background matching the app theme
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9, // Standard video aspect ratio
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  video: { 
    flex: 1,
    backgroundColor: '#000'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: 20,
    marginRight: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
});
