import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Linking, Platform, StatusBar, Dimensions, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import UniversalVideoPlayer from '../../components/common/UniversalVideoPlayer';
import { notificationService } from '../../services/notificationService';
import { authAPI, attendanceAPI, contentAPI, workshopAPI, userAPI, qaAPI, appointmentAPI } from '../../services/api';

import { getFontFamily } from '../../styles/fonts';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../../config';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import ProgressStrip from '../../components/dashboard/ProgressStrip';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import QuickActions from '../../components/dashboard/QuickActions';
import WorkshopList from '../../components/dashboard/WorkshopList';
import RoutineList from '../../components/dashboard/RoutineList';

export default function ChemsingDashboard({ navigation, route }) {
  const [user, setUser] = useState({ name: '', level: 1, profilePicture: null });
  const [videos, setVideos] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [habitModal, setHabitModal] = useState(null);
  const [completionModal, setCompletionModal] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [workshops, setWorkshops] = useState([]);
  const [sessionWorkshops, setSessionWorkshops] = useState([]);
  const [menuModal, setMenuModal] = useState(false);
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [manifestationVideo, setManifestationVideo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [healingModal, setHealingModal] = useState(false);
  const [healingForm, setHealingForm] = useState({ name: '', description: '', photo: null });
  const [datePickerVisible, setDatePickerVisible] = useState(false); // For Appointment Modal
  const [customSuccessModal, setCustomSuccessModal] = useState(null); // For custom success messages
  const [videoCompletionModal, setVideoCompletionModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [lockedModal, setLockedModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [routineCompleteModal, setRoutineCompleteModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [routineCompleted, setRoutineCompleted] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [qaModal, setQaModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [incompleteModal, setIncompleteModal] = useState(null);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [expandedQA, setExpandedQA] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [customErrorModal, setCustomErrorModal] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showQA, setShowQA] = useState(false);

  const DOCTORS = [
    { id: 1, name: 'Dr. Vivekananthan (Yoga)', specialty: 'Yoga Therapy', icon: 'spa' },
    { id: 2, name: 'Dr. Vivekananthan (Meditation)', specialty: 'Meditation & Mindfulness', icon: 'self-improvement' },
    { id: 3, name: 'Dr. Vivekananthan (Wellness)', specialty: 'Holistic Wellness', icon: 'healing' }
  ];

  useEffect(() => {
    loadDashboard();
    loadManifestationVideo();
    loadAppointments();
    loadQA();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    const username = await AsyncStorage.getItem('username');
    const count = await notificationService.getUnreadCount(username);
    setUnreadCount(count);
  };



  useEffect(() => {
    if (user.level) {
      loadWorkshops(user.level);
    }
  }, [user.level]);



  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh unread count when screen comes into focus
      loadUnreadCount();

      if (route.params?.completedStep) {
        const step = route.params.completedStep;
        setCompletedSteps(prev => ({ ...prev, [step]: true }));
        navigation.setParams({ completedStep: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.completedStep]);

  useEffect(() => {
    if (activeTab === 'support') {
      loadAppointments();
      loadQA();
      loadSessionWorkshops(user.level);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'habits') {
      loadHabits();
    }
  }, [activeTab]);

  const loadHabits = async () => {
    try {
      const habitsData = await contentAPI.getHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
      setHabits([]);
    }
  };

  const pickHealingImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Using string literal to avoid deprecation warning and undefined crash
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setHealingForm(prev => ({ ...prev, photo: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error in pickHealingImage:', error);
      alert('Error picking image: ' + error.message);
    }
  };

  const uploadHealingEntry = async () => {
    if (!healingForm.name || !healingForm.photo) {
      alert('Please provide a name and a photo.');
      return;
    }

    const formData = new FormData();
    formData.append('username', user.name || 'User');
    formData.append('name', healingForm.name);
    formData.append('description', healingForm.description || '');

    const uri = healingForm.photo;
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri: uri,
      name: filename,
      type: type,
    });

    try {
      await contentAPI.uploadHealingPhoto(formData);
      setHealingModal(false);
      setHealingForm({ name: '', description: '', photo: null });
      setCustomSuccessModal('Healing photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload: ' + error.message);
    }
  };

  const loadDashboard = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const storedProfilePic = await AsyncStorage.getItem('profilePicture');
      let profilePicUrl = null;
      if (storedProfilePic) {
        // If it's already a full http url, utilize it, otherwise prepend base
        // The backend stores it as /uploads/filename.ext
        const baseUrl = API_URL.replace('/api/v1', '');
        profilePicUrl = storedProfilePic.startsWith('http')
          ? storedProfilePic
          : `${baseUrl}${storedProfilePic}`;
      }

      const data = await userAPI.getContentProfile(username);

      setUser({ name: username || 'User', level: data?.level || 1, profilePicture: profilePicUrl });

      // Calculate progress with better error handling
      const calculatedProgress = data?.totalVideos > 0
        ? ((data.currentVideoIndex / data.totalVideos) * 100)
        : 0;
      setProgress(calculatedProgress || 0);

      const routinesData = await contentAPI.getRoutines();
      setRoutines(Array.isArray(routinesData) ? routinesData : []);

      const habitsData = await contentAPI.getHabits();
      setHabits(Array.isArray(habitsData) ? habitsData : []);

      // Get days completed
      const aData = await attendanceAPI.getUserAttendance(username);
      setDaysCompleted(Array.isArray(aData) ? aData.filter(a => a?.attended).length : 0);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setUser({ name: 'User', level: 1 });
      setProgress(0); // Ensure progress is set to 0 on error
      setRoutines([]);
      setHabits([]);
      setDaysCompleted(0);
    }
  };


  const loadManifestationVideo = async () => {
    try {
      const data = await contentAPI.getManifestationVideo();
      if (data) setManifestationVideo(data);
    } catch (error) {
      // Silently fail if manifestation video not available yet
    }
  };

  const loadAppointments = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const data = await appointmentAPI.getUserAppointments(username);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filtered = data.filter(apt => new Date(apt.requestedDate) >= thirtyDaysAgo);
      setAppointments(filtered);
    } catch (error) {
      console.log('Error loading appointments:', error);
      setCustomErrorModal('Failed to load appointments: ' + error.message);
      setAppointments([]);
    }
  };

  const loadQA = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const data = await qaAPI.getUserQuestions(username);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filtered = data.filter(qa => new Date(qa.createdAt) >= thirtyDaysAgo);
      setQaList(filtered);
    } catch (error) {
      console.log('Error loading Q&A:', error);
      setQaList([]);
    }
  };

  const askQuestion = async () => {
    if (!newQuestion.trim()) {
      setCustomErrorModal('Please enter your question');
      return;
    }
    try {
      const username = await AsyncStorage.getItem('username');
      await qaAPI.askQuestion(username, newQuestion);

      // Notify admin of new question
      await notificationService.notifyAdminNewQuestion('admin', { username, question: newQuestion });

      setQaModal(false);
      setNewQuestion('');
      setCustomSuccessModal('Your question has been submitted! Admin will reply soon.');
      loadQA();
    } catch (error) {
      setCustomErrorModal('Failed to submit question');
    }
  };

  const requestAppointment = async () => {
    if (!selectedDoctor) {
      setCustomErrorModal('Please select a doctor');
      return;
    }
    if (!appointmentReason.trim()) {
      setCustomErrorModal('Please enter a reason for your appointment');
      return;
    }
    try {
      const username = await AsyncStorage.getItem('username');
      await appointmentAPI.requestAppointment(username, appointmentReason, selectedDoctor.name);

      setAppointmentModal(false);
      setAppointmentReason('');
      setSelectedDoctor(null);
      setCustomSuccessModal('Appointment request submitted! Admin will review and schedule it.');
      loadAppointments();
    } catch (error) {
      setCustomErrorModal(error.message || 'Failed to submit appointment request. Please try again.');
    }
  };

  const loadLevelVideos = async (level) => {
    try {
      const allVideos = await contentAPI.getVideos();
      const levelVideos = Array.isArray(allVideos) ? allVideos.filter(v => v.level === level) : [];
      setVideos(levelVideos);
    } catch (error) {
      console.log('Error loading videos:', error);
      setVideos([]);
    }
  };

  const loadWorkshops = async (level) => {
    try {
      const data = await workshopAPI.getWorkshopsByLevel(level);
      setWorkshops(data);
    } catch (error) {
      console.error('Error loading workshops:', error);
      setWorkshops([]);
    }
  };

  const loadSessionWorkshops = async (level) => {
    try {
      const data = await workshopAPI.getSessionWorkshops(level);
      setSessionWorkshops(data);
    } catch (error) {
      console.error('Error loading session workshops:', error);
      setSessionWorkshops([]);
    }
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const playVideo = (videoUrl) => {
    setPlayingVideo(videoUrl);
  };



  const completeVideo = async (videoId) => {
    setVideoCompletionModal(videoId);
  };

  const confirmVideoCompletion = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      await contentAPI.completeVideo(username, videoCompletionModal);

      setVideoCompletionModal(null);
      setVideoCompleted(true);
      setActiveTab('routine');
      loadDashboard();
    } catch (error) {
      console.error('Error completing video:', error);
      setErrorModal('Failed to mark video as complete. Please try again.');
    }
  };

  const submitHabit = async (habitId, answer) => {
    const username = await AsyncStorage.getItem('username');
    await contentAPI.completeHabits(username);
    // Note: old code called complete-habits without habitId? Assuming habits are bulk completed.
    setHabitModal(null);
    setCompletionModal(true);
  };

  const markAttendance = async (attended) => {
    const username = await AsyncStorage.getItem('username');
    try {
      if (attended) {
        // Validate all 7 steps of daily routine are completed
        const allStepsCompleted = [1, 2, 3, 4, 5, 6, 7].every(step => completedSteps[step]);
        if (!allStepsCompleted) {
          setErrorModal('Please complete all 7 steps of Daily Routine before marking attendance as Present');
          setCompletionModal(false);
          return;
        }

        const allHabitsCompleted = Array.isArray(habits) && habits.length > 0 ?
          habits.every(h => completedSteps[`habit_${h?.id}`]) : true;
        if (!allHabitsCompleted) {
          setErrorModal('Please complete all habits before marking attendance as Present');
          setCompletionModal(false);
          return;
        }

        // Mark all progress as completed for Present
        await contentAPI.completeRoutine(username);
        await contentAPI.completeHabits(username);
      }
      // For Absent: Don't mark any tasks as completed

      // Mark attendance
      await attendanceAPI.markAttendance(attended);

      setCompletionModal(false);

      // Send notification
      await notificationService.notifyAttendanceMarked(username, attended ? 'present' : 'absent');

      setSuccessModal(attended ? 'Present' : 'Absent');
      await loadDashboard();
      setActiveTab('levels');
      // Reset completion flags for next day
      setCompletedSteps({});
    } catch (error) {
      setCompletionModal(false);
      setErrorModal(error.message || 'Failed to mark attendance. Please try again.');
    }
  };

  const getLevelColor = (level) => {
    const colors = { 1: '#b37e68', 2: '#FF9F43', 3: '#9B59B6' };
    return colors[level] || '#00B894';
  };

  const getLevelName = (level) => {
    const names = { 1: 'NarKarma Viruthi', 2: 'Suya Viruthi', 3: 'Yoga Viruthi' };
    return names[level] || 'Level 1';
  };

  const groupVideosByPart = (videos) => {
    const part1 = videos.filter(v => v.part === 1 || v.part === 'Part 1');
    const part2 = videos.filter(v => v.part === 2 || v.part === 'Part 2');
    return { part1, part2 };
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('profilePicture');
    navigation.navigate('Login');
  };
  const pickProfileImage = async () => {
    try {
      console.log('Requesting permission...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      console.log('Launching image picker...');
      // Using launchImageLibraryAsync based on the detailed object dump provided
      if (!ImagePicker || !ImagePicker.launchImageLibraryAsync) {
        console.error('ImagePicker library seems corrupted or method missing:', ImagePicker);
        Alert.alert('Error', 'ImagePicker library error. Please restart app.');
        return;
      }

      // Using string literal to avoid deprecation warning and undefined crash
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        uploadProfileImage(localUri);
      }
    } catch (error) {
      console.error('Error in pickProfileImage:', error);
      Alert.alert('Error', 'Failed to open gallery: ' + error.message);
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      console.log('Uploading image for user:', user.name);
      if (!user.name) {
        throw new Error('Username is missing. Please re-login.');
      }

      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', { uri, name: filename, type });
      // username is sent via URL parameter, removing from body to avoid "koushik5,koushik5" duplication issue

      console.log('Calling authAPI.updateProfilePicture...');
      const res = await authAPI.updateProfilePicture(user.name, formData);

      // Construct full URL (Assuming API_URL is like http://.../api/v1)
      const baseUrl = API_URL.replace('/api/v1', '');
      const fullUrl = res.url.startsWith('http') ? res.url : `${baseUrl}${res.url}`;

      // Force refresh image by appending timestamp
      const urlWithTimestamp = `${fullUrl}?t=${new Date().getTime()}`;

      // Update state and storage
      setUser(prev => ({ ...prev, profilePicture: urlWithTimestamp }));
      await AsyncStorage.setItem('profilePicture', res.url); // Store relative URL as received from backend preference

      setProfileModal(false); // Close modal
      setCustomSuccessModal('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setCustomErrorModal('Failed to upload image: ' + error.message);
    }
  };

  const getStatusBarHeight = () => Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const getBottomSpace = () => {
    const { height, width } = Dimensions.get('window');
    return (height / width) > 2 ? 20 : 0;
  };

  return (
    <View style={styles.container}>
      <DashboardHeader
        user={user}
        unreadCount={unreadCount}
        navigation={navigation}
        setMenuModal={setMenuModal}
        getStatusBarHeight={getStatusBarHeight}
        getLevelColor={getLevelColor}
      />

      <ProgressStrip user={user} daysCompleted={daysCompleted} />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'levels' && (
          <View>
            {/* Welcome Banner */}
            <WelcomeBanner daysCompleted={daysCompleted} user={user} getLevelName={getLevelName} />

            {/* Quick Actions */}
            <QuickActions setActiveTab={setActiveTab} />

            <TouchableOpacity
              style={styles.shareCard}
              onPress={() => setHealingModal(true)}
            >
              <MaterialIcons name="camera-alt" size={24} color="#ffb495" />
              <View>
                <Text style={styles.shareCardTitle}>Share Your Healing</Text>
                <Text style={styles.shareCardDesc}>Post a photo of your progress</Text>
              </View>
            </TouchableOpacity>

            {/* Workshops Section */}
            <WorkshopList
              workshops={workshops}
              selectedLevel={selectedLevel}
              getLevelName={getLevelName}
              getLevelColor={getLevelColor}
            />


          </View>
        )}


        {activeTab === 'chemsing' && selectedLevel && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Videos →{"\n"}{getLevelName(selectedLevel)}</Text>
              {!Array.isArray(videos) || videos.length === 0 ? (
                <Text style={styles.noVideos}>No videos available yet</Text>
              ) : (
                videos.map((video, i) => (
                  <View key={video.id} style={styles.videoTile}>
                    <View style={styles.videoThumb}>
                      <Text style={styles.orderBadge}>#{i + 1}</Text>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle}>{video.title}</Text>
                      <Text style={styles.videoDuration}>{video.description}</Text>
                    </View>
                    <TouchableOpacity style={styles.playBtn} onPress={() => completeVideo(video.id)}>
                      <Text style={styles.playBtnText}>Play</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Workshops Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitleBold}>Upcoming Workshops</Text>
              <Text style={styles.workshopSubtitle}>Level {selectedLevel} - {getLevelName(selectedLevel)}</Text>
              {Array.isArray(workshops) && workshops.length > 0 ? (
                workshops.map((workshop) => (
                  <View key={workshop.id} style={styles.workshopCard}>
                    <View style={styles.workshopHeader}>
                      <Text style={styles.workshopTime}>
                        {new Date(workshop.startTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(workshop.level) }]}>
                        <Text style={styles.levelBadgeText}>Level {workshop.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.workshopTitle}>{workshop.title}</Text>
                    <Text style={styles.workshopDesc}>{workshop.description}</Text>
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() => Linking.openURL(workshop.link)}>
                      <Text style={styles.joinBtnText}>Join Workshop →</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noWorkshops}>No workshops scheduled yet</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'routine' && (
          <RoutineList
            completedSteps={completedSteps}
            navigation={navigation}
            onCompleteRoutine={() => { setRoutineCompleted(true); setRoutineCompleteModal(true); }}
          />
        )}

        {activeTab === 'habits' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitleBold}>Habit Tracker</Text>
              <Text style={styles.habitSubtitle}>Complete your daily habits</Text>
              {Array.isArray(habits) && habits.length > 0 ? habits.map((habit) => (
                <View key={habit?.id || Math.random()} style={styles.habitItem}>
                  <View style={styles.habitContent}>
                    <Text style={styles.habitTitle}>{habit?.name || 'Habit'}</Text>
                    <Text style={styles.habitDesc}>{habit?.description || ''}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.habitCheck, completedSteps[`habit_${habit?.id}`] && styles.habitCheckDone]}
                    onPress={() => setCompletedSteps({ ...completedSteps, [`habit_${habit?.id}`]: true })}>
                    <Text style={styles.habitCheckText}>{completedSteps[`habit_${habit?.id}`] ? '✓' : '○'}</Text>
                  </TouchableOpacity>
                </View>
              )) : (
                <Text style={styles.noVideos}>No habits available yet</Text>
              )}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={() => {
              const incompleteTasks = [];

              // Check Step 1 (Video is mandatory)
              if (!completedSteps[1]) {
                incompleteTasks.push('Video');
              }

              // Check other steps
              const missingSteps = [1, 2, 3, 4, 5, 6, 7].filter(step => !completedSteps[step]);
              if (missingSteps.length > 0) {
                incompleteTasks.push(`Daily Routine: ${missingSteps.join(', ')}`);
              }

              const allHabitsCompleted = Array.isArray(habits) && habits.length > 0 ?
                habits.every(h => completedSteps[`habit_${h?.id}`]) : true;
              if (!allHabitsCompleted) incompleteTasks.push('Habit Tracker');

              if (incompleteTasks.length > 0) {
                setIncompleteModal(incompleteTasks);
              } else {
                setCompletionModal(true);
              }
            }}>
              <Text style={styles.submitBtnText}>Submit & Mark Attendance</Text>
            </TouchableOpacity>


          </View>
        )}

        {activeTab === 'support' && (
          <View>
            {/* Appointments Section */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowAppointments(!showAppointments)}>
                <View style={styles.dropdownTitleRow}>
                  <MaterialIcons name="event" size={24} color="#ffb495" />
                  <Text style={styles.cardTitleBold}>Appointments ({Array.isArray(appointments) ? appointments.length : 0})</Text>
                </View>
                <MaterialIcons name={showAppointments ? "expand-less" : "expand-more"} size={24} color="#666" />
              </TouchableOpacity>

              {showAppointments && (
                <View style={styles.dropdownContent}>
                  <Text style={styles.habitSubtitle}>Book a session with our instructors</Text>

                  {Array.isArray(appointments) && appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <TouchableOpacity
                        key={apt.id}
                        style={[
                          styles.qaCard,
                          { borderLeftColor: apt.status === 'APPROVED' ? '#28a745' : apt.status === 'REJECTED' ? '#E74C3C' : '#ffc107' }
                        ]}
                        onPress={() => setExpandedAppointment(expandedAppointment === apt.id ? null : apt.id)}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={styles.qaCardLabel}>Request:</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[
                              styles.qaBadge,
                              { backgroundColor: apt.status === 'APPROVED' ? '#28a745' : apt.status === 'REJECTED' ? '#dc3545' : '#ffc107' }
                            ]}>
                              <Text style={styles.qaBadgeText}>{apt.status}</Text>
                            </View>
                            <MaterialIcons name={expandedAppointment === apt.id ? "expand-less" : "expand-more"} size={24} color="#666" />
                          </View>
                        </View>
                        {expandedAppointment === apt.id ? (
                          <View style={styles.expandedContent}>
                            <Text style={styles.appointmentTitle}>{apt.reason}</Text>
                            <Text style={styles.qaCardDate}>
                              Requested: {new Date(apt.requestedDate).toLocaleDateString()}
                            </Text>
                            {apt.scheduledDate && apt.status === 'APPROVED' && (
                              <Text style={[styles.qaCardDate, { color: '#00A8A8', fontWeight: 'bold' }]}>
                                Scheduled: {new Date(apt.scheduledDate).toLocaleString()}
                              </Text>
                            )}
                            {apt.adminNotes && (
                              <View style={styles.qaAnswerBox}>
                                <Text style={styles.qaAnswerLabel}>Admin Note:</Text>
                                <Text style={styles.qaAnswerText}>{apt.adminNotes}</Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          <Text style={styles.appointmentTitle} numberOfLines={1}>{apt.reason}</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.appointmentBox}>
                      <MaterialIcons name="event" size={48} color="#00A8A8" style={{ alignSelf: 'center', marginBottom: 12 }} />
                      <Text style={styles.appointmentText}>No appointments yet. Schedule a one-on-one session with our experienced instructors for personalized guidance.</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.submitBtn} onPress={() => setAppointmentModal(true)}>
                    <Text style={styles.submitBtnText}>Request New Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Session Workshops */}
            <WorkshopList
              workshops={sessionWorkshops}
              selectedLevel={null}
              getLevelName={getLevelName}
              getLevelColor={getLevelColor}
              title="Session Workshops"
              subtitle="Join live sessions and workshops"
            />

            {/* Q&A Section */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowQA(!showQA)}>
                <View style={styles.dropdownTitleRow}>
                  <MaterialIcons name="question-answer" size={24} color="#ffb495" />
                  <Text style={styles.cardTitleBold}>Questions & Answers ({Array.isArray(qaList) ? qaList.length : 0})</Text>
                </View>
                <MaterialIcons name={showQA ? "expand-less" : "expand-more"} size={24} color="#666" />
              </TouchableOpacity>

              {showQA && (
                <View style={styles.dropdownContent}>
                  <Text style={styles.habitSubtitle}>Ask questions and get replies from admin</Text>

                  {Array.isArray(qaList) && qaList.length > 0 ? (
                    qaList.map((qa) => (
                      <TouchableOpacity
                        key={qa.id}
                        style={[
                          styles.qaCard,
                          { borderLeftColor: qa.status === 'ANSWERED' ? '#28a745' : '#ffc107' }
                        ]}
                        onPress={() => setExpandedQA(expandedQA === qa.id ? null : qa.id)}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={styles.qaCardLabel}>Your Question:</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[
                              styles.qaBadge,
                              { backgroundColor: qa.status === 'ANSWERED' ? '#28a745' : '#ffc107' }
                            ]}>
                              <Text style={styles.qaBadgeText}>{qa.status}</Text>
                            </View>
                            <MaterialIcons name={expandedQA === qa.id ? "expand-less" : "expand-more"} size={24} color="#666" />
                          </View>
                        </View>
                        {expandedQA === qa.id ? (
                          <View style={styles.expandedContent}>
                            <Text style={styles.qaCardQuestion}>{qa.question}</Text>
                            <Text style={styles.qaCardDate}>
                              Asked: {new Date(qa.createdAt).toLocaleString()}
                            </Text>
                            {qa.answer && (
                              <View style={styles.qaAnswerBox}>
                                <Text style={styles.qaAnswerLabel}>Admin Reply:</Text>
                                <Text style={styles.qaAnswerText}>{qa.answer}</Text>
                                <Text style={styles.qaAnswerDate}>
                                  Replied: {new Date(qa.answeredAt).toLocaleString()}
                                </Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          <Text style={styles.qaCardQuestion} numberOfLines={1}>{qa.question}</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.appointmentBox}>
                      <MaterialIcons name="question-answer" size={48} color="#00A8A8" style={{ alignSelf: 'center', marginBottom: 12 }} />
                      <Text style={styles.appointmentText}>No questions yet. Ask your questions and get personalized answers from admin.</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.submitBtn} onPress={() => setQaModal(true)}>
                    <Text style={styles.submitBtnText}>Ask New Question</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* FAQ Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitleBold}>FAQ</Text>
              <Text style={styles.habitSubtitle}>Frequently Asked Questions</Text>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do chakra cleansing?</Text>
                <Text style={styles.faqAnswer}>A: Preferably on an empty stomach in the morning. If that’s not possible, practice at
                  least 2 hours after eating.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: How many times can chakra cleansing be done?</Text>
                <Text style={styles.faqAnswer}>A: Recommended once a day. If you wish to repeat the practice the same day, do
                  so only after at least 9 hours have passed since the first session.</Text>
              </View>


              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: Can we drink water during the practice?</Text>
                <Text style={styles.faqAnswer}>A: Do not drink water during the chakra-cleansing practice. You may drink water up
                  to 30 minutes before or after the session.</Text>
              </View>


              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: Will these practices increase body heat?</Text>
                <Text style={styles.faqAnswer}>A: Yes — these practices can naturally raise body heat. It is recommended to take
                  a full-body (head-to-toe) oil bath twice a week.
                  Additionally, performing the fifth exercise of the chakra-cleansing routine in the
                  evening (or when convenient) may help reduce excess body heat.</Text>
              </View>


              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: Will we get tired doing these practices?</Text>
                <Text style={styles.faqAnswer}>A: Some people may feel tired depending on their current health condition. These
                  practices are meant to build energy in the body. Usually within a week or two,
                  any excessive tiredness settles down and the body becomes more active
                  and energetic.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do forgiveness practice?</Text>
                <Text style={styles.faqAnswer}>A: Forgiveness can be read at any time during the day. Preferably follow the
                  schedule given in your class. You may also read the forgiveness practice before
                  each manifestation session.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do meditation?</Text>
                <Text style={styles.faqAnswer}>A: Twice daily — once in the morning and once at night before sleep, following the
                  schedule provided in class.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do thithi / tharpanam?</Text>
                <Text style={styles.faqAnswer}>A: Perform before each meal. For further questions about timing or procedure,
                  contact admin.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: If you experience discomfort after these practices (for example: pain in any
                  part of the body, overheating, excessive tiredness, or excessive sleep):</Text>
                <Text style={styles.faqAnswer}>A: 1. Please do not overstrain your body — listen to your body and slow down if
                  needed.</Text>
                <Text style={styles.faqAnswer}>2. Contact Sittha Viruthi Yoga admin (available 10:00 AM – 6:00 PM, except
                  Sunday).</Text>
                <Text style={styles.faqAnswer}>3. Stop the practice if symptoms are severe or worsening. If you experience
                  serious symptoms (severe pain, fainting, chest pain, severe shortness of
                  breath, etc.), seek medical attention immediately.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: getBottomSpace() + 10 }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('levels')}>
          <MaterialIcons name="home" size={24} color={(activeTab === 'levels' || activeTab === 'chemsing') ? '#ffb495' : '#999'} />
          <Text style={[styles.navLabel, (activeTab === 'levels' || activeTab === 'chemsing') && { color: '#ffb495', fontWeight: 'bold' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('routine')}>
          <MaterialIcons name="assignment" size={24} color={activeTab === 'routine' ? '#ffb495' : '#999'} />
          <Text style={[styles.navLabel, activeTab === 'routine' && { color: '#ffb495', fontWeight: 'bold' }]}>Daily Routine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('habits')}>
          <MaterialIcons name="check-circle" size={24} color={activeTab === 'habits' ? '#ffb495' : '#999'} />
          <Text style={[styles.navLabel, activeTab === 'habits' && { color: '#ffb495', fontWeight: 'bold' }]}>Habit Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('support')}>
          <MaterialIcons name="support-agent" size={24} color={activeTab === 'support' ? '#ffb495' : '#999'} />
          <Text style={[styles.navLabel, activeTab === 'support' && { color: '#ffb495', fontWeight: 'bold' }]}>Support</Text>
        </TouchableOpacity>
      </View>

      {completionModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="celebration" size={64} color="#00A8A8" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <Text style={styles.modalDesc}>Did you complete all tasks today?

                • Daily Routine (7 Steps)
                • Habit Tracker

                Note: Select "Absent" if you didn't complete the tasks.</Text>

              <View style={styles.qaButtons}>
                <TouchableOpacity style={styles.yesBtn} onPress={() => markAttendance(true)}>
                  <Text style={styles.qaText}>Yes - Present</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noBtn} onPress={() => markAttendance(false)}>
                  <Text style={styles.qaText}>No - Absent</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.closeBtnWithMargin} onPress={() => setCompletionModal(false)}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {habitModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{habitModal.name}</Text>
              <Text style={styles.modalDesc}>{habitModal.description}</Text>

              <View style={styles.qaSection}>
                <Text style={styles.qaTitle}>Completed?</Text>
                <View style={styles.qaButtons}>
                  <TouchableOpacity style={styles.yesBtn} onPress={() => submitHabit(habitModal.id, 'Yes')}>
                    <Text style={styles.qaText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.noBtn} onPress={() => submitHabit(habitModal.id, 'No')}>
                    <Text style={styles.qaText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setHabitModal(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Menu Modal */}
      {menuModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  {user.profilePicture ? (
                    <Image source={{ uri: user.profilePicture }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                  ) : (
                    <Text style={styles.menuAvatarText}>{user.name[0]?.toUpperCase()}</Text>
                  )}
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{user.name}</Text>
                  <View style={[styles.menuLevelBadge, { backgroundColor: getLevelColor(user.level) }]}>
                    <Text style={styles.menuLevelText}>Level {user.level} - {getLevelName(user.level)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuStats}>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>{daysCompleted}</Text>
                  <Text style={styles.menuStatLabel}>Days Completed</Text>
                </View>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>{Math.round((() => {
                    if (user.level === 1) return Math.min((daysCompleted / 120) * 100, 100);
                    if (user.level === 2) return Math.min(Math.max(daysCompleted - 120, 0) / 120 * 100, 100);
                    if (user.level === 3) return Math.min(Math.max(daysCompleted - 240, 0) / 120 * 100, 100);
                    return 0;
                  })())}%</Text>
                  <Text style={styles.menuStatLabel}>Level Progress</Text>
                </View>
              </View>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModal(false); setProfileModal(true); }}>
                <MaterialIcons name="person" size={24} color="#ffb495" />
                <Text style={styles.menuItemText}>Profile Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={async () => {
                try {
                  const username = await AsyncStorage.getItem('username');
                  const aData = await attendanceAPI.getUserAttendance(username);
                  const totalDays = Array.isArray(aData) ? aData.length : 0;
                  const presentDays = Array.isArray(aData) ? aData.filter(a => a.attended).length : 0;
                  const absentDays = totalDays - presentDays;
                  setProgressData({ totalDays, presentDays, absentDays });
                  setMenuModal(false);
                  setProgressModal(true);
                } catch (error) {
                  Alert.alert('Error', 'Failed to load progress data');
                }
              }}>
                <MaterialIcons name="bar-chart" size={24} color="#ffb495" />
                <Text style={styles.menuItemText}>My Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModal(false); navigation.navigate('About'); }}>
                <MaterialIcons name="info" size={24} color="#ffb495" />
                <Text style={styles.menuItemText}>About</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <Text style={styles.versionText}>Version 1.0.0</Text>

              <TouchableOpacity style={styles.logoutBtn} onPress={() => { setMenuModal(false); setShowLogoutModal(true); }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <MaterialIcons name="logout" size={20} color="#fff" />
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeMenuBtn} onPress={() => setMenuModal(false)}>
                <Text style={styles.closeMenuBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}



      {/* Video Completion Modal */}
      {videoCompletionModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="check-circle" size={64} color="#00A8A8" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Complete Video?</Text>
              <Text style={styles.modalDesc}>Have you finished watching the video?</Text>

              <View style={styles.qaButtons}>
                <TouchableOpacity style={styles.yesBtn} onPress={confirmVideoCompletion}>
                  <Text style={styles.qaText}>Yes, Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noBtn} onPress={() => setVideoCompletionModal(null)}>
                  <Text style={styles.qaText}>Not Yet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Error Modal */}
      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={64} color="#E74C3C" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Locked Level Modal */}
      {lockedModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="lock" size={64} color="#FF9F43" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Level Locked</Text>
              <Text style={styles.modalDesc}>{lockedModal}</Text>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setLockedModal(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Attendance Marked!</Text>
              <Text style={styles.successDesc}>
                Your attendance has been marked as {successModal === 'Present' ? '✓ Present' : '✗ Absent'}
              </Text>
              <Text style={styles.successDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

              <TouchableOpacity style={styles.successBtn} onPress={() => { setSuccessModal(null); setActiveTab('levels'); }}>
                <Text style={styles.successBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Profile Settings Modal */}
      {profileModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={styles.modalTitle}>Profile Settings</Text>
                <TouchableOpacity onPress={() => setProfileModal(false)}>
                  <MaterialIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={{ alignSelf: 'center', marginBottom: 16, position: 'relative' }}>
                <TouchableOpacity onPress={pickProfileImage}>
                  {user.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                    />
                  ) : (
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#00A8A8', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 32, fontFamily: bodyRegular }}>{user.name[0]?.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1B3B6F', borderRadius: 12, padding: 4, borderWidth: 2, borderColor: '#fff' }}>
                    <MaterialIcons name="edit" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileLabel}>Username:</Text>
                <Text style={styles.profileValue}>{user.name}</Text>
              </View>
              <View style={styles.profileLevelItem}>
                <MaterialIcons name="trending-up" size={24} color="#00A8A8" style={{ marginBottom: 8 }} />
                <Text style={styles.profileLabel}>Current Level</Text>
                <Text style={styles.profileLevelText}>Level {user.level}</Text>
                <Text style={styles.profileLevelSubtext}>{getLevelName(user.level)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileLabel}>Days Completed:</Text>
                <Text style={styles.profileValue}>{daysCompleted} days</Text>
              </View>
              <Text style={styles.profileNote}>Contact admin to update your profile information.</Text>
            </View>
          </View>
        </Modal>
      )}

      {healingModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#fff8f4' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontFamily: 'JosefinSans-Bold', fontSize: 20, color: '#04223e' }}>Share Your Healing</Text>
                <TouchableOpacity onPress={() => setHealingModal(false)}>
                  <MaterialIcons name="close" size={24} color="#04223e" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontFamily: 'WorkSans-Regular', color: '#516f8b', marginBottom: 20 }}>
                Share your daily progress with the community. Your post will be visible for 14 days.
              </Text>

              <TextInput
                style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ffcbb5', marginBottom: 12, fontFamily: 'WorkSans-Regular', color: '#04223e' }}
                placeholder="Title / Name"
                placeholderTextColor="#b37e68"
                value={healingForm.name}
                onChangeText={(text) => setHealingForm({ ...healingForm, name: text })}
              />

              <TextInput
                style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ffcbb5', marginBottom: 12, height: 80, textAlignVertical: 'top', fontFamily: 'WorkSans-Regular', color: '#04223e' }}
                placeholder="Description (Optional)"
                placeholderTextColor="#b37e68"
                multiline
                value={healingForm.description}
                onChangeText={(text) => setHealingForm({ ...healingForm, description: text })}
              />

              <TouchableOpacity
                style={{ backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ffcbb5', borderStyle: 'dashed', alignItems: 'center', marginBottom: 20 }}
                onPress={pickHealingImage}
              >
                {healingForm.photo ? (
                  <Image source={{ uri: healingForm.photo }} style={{ width: '100%', height: 200, borderRadius: 8 }} resizeMode="cover" />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={32} color="#b37e68" />
                    <Text style={{ marginTop: 8, color: '#b37e68', fontFamily: 'WorkSans-Regular' }}>Tap to upload photo</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#04223e', padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#04223e', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }}
                onPress={uploadHealingEntry}
              >
                <Text style={{ color: '#ffffff', fontFamily: 'JosefinSans-Bold', fontSize: 16 }}>Share to Community</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}


      {/* My Progress Modal */}
      {
        progressModal && progressData && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MaterialIcons name="bar-chart" size={64} color="#00A8A8" style={{ alignSelf: 'center', marginBottom: 16 }} />
                <Text style={styles.modalTitle}>My Progress</Text>

                <View style={styles.progressStatsGrid}>
                  <View style={styles.progressStatBox}>
                    <Text style={styles.progressStatValue}>{progressData.totalDays}</Text>
                    <Text style={styles.progressStatLabel}>Total Days</Text>
                  </View>
                  <View style={[styles.progressStatBox, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.progressStatValue, { color: '#27AE60' }]}>{progressData.presentDays}</Text>
                    <Text style={styles.progressStatLabel}>Present</Text>
                  </View>
                  <View style={[styles.progressStatBox, { backgroundColor: '#FFEBEE' }]}>
                    <Text style={[styles.progressStatValue, { color: '#E74C3C' }]}>{progressData.absentDays}</Text>
                    <Text style={styles.progressStatLabel}>Absent</Text>
                  </View>
                </View>

                <View style={styles.levelProgressBox}>
                  <Text style={styles.levelProgressTitle}>Current Level: {user.level}</Text>
                  <Text style={styles.levelProgressDesc}>{getLevelName(user.level)}</Text>
                  <Text style={styles.levelProgressDays}>
                    {user.level === 1 && `${progressData.presentDays}/120 days (${120 - progressData.presentDays} days to Level 2)`}
                    {user.level === 2 && `${progressData.presentDays}/240 days (${240 - progressData.presentDays} days to Level 3)`}
                    {user.level === 3 && `${progressData.presentDays}/360 days (Completed)`}
                  </Text>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setProgressModal(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }


      {/* Routine Complete Modal */}
      {
        routineCompleteModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.successModalContent}>
                <View style={styles.successIconCircle}>
                  <MaterialIcons name="check" size={48} color="#FFFFFF" />
                </View>
                <Text style={styles.successTitle}>Daily Routine Complete!</Text>
                <Text style={styles.successDesc}>
                  Congratulations! You've completed all 7 steps of your daily routine.
                </Text>
                <Text style={styles.successDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

                <TouchableOpacity style={styles.successBtn} onPress={() => { setRoutineCompleteModal(false); setActiveTab('habits'); }}>
                  <Text style={styles.successBtnText}>Go to Habit Tracker</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }

      {/* Q&A Modal */}
      {
        qaModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MaterialIcons name="question-answer" size={64} color="#ffb495" style={{ alignSelf: 'center', marginBottom: 16 }} />
                <Text style={styles.modalTitle}>Ask a Question</Text>
                <Text style={styles.modalDesc}>Submit your question and admin will reply as soon as possible.</Text>

                <TextInput
                  style={styles.qaInput}
                  placeholder="Type your question here..."
                  placeholderTextColor="#999"
                  multiline
                  value={newQuestion}
                  onChangeText={setNewQuestion}
                />

                <TouchableOpacity style={[styles.submitBtn, { marginBottom: 0 }]} onPress={askQuestion}>
                  <Text style={styles.submitBtnText}>Submit Question</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeBtnWithMargin} onPress={() => { setQaModal(false); setNewQuestion(''); }}>
                  <Text style={styles.closeBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }

      {/* Incomplete Tasks Modal */}
      {
        incompleteModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MaterialIcons name="warning" size={64} color="#FF9F43" style={{ alignSelf: 'center', marginBottom: 16 }} />
                <Text style={styles.modalTitle}>Incomplete Tasks</Text>
                <Text style={styles.modalDesc}>Please complete the following tasks before marking attendance:</Text>

                <View style={styles.incompleteTasksList}>
                  {incompleteModal.map((task, index) => (
                    <View key={index} style={styles.incompleteTaskItem}>
                      <MaterialIcons name="cancel" size={20} color="#E74C3C" />
                      <Text style={styles.incompleteTaskText}>{task}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setIncompleteModal(null)}>
                  <Text style={styles.closeBtnText}>Got It</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }

      {/* Appointment Request Modal */}
      {
        appointmentModal && (
          <Modal visible={true} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.appointmentModalBox}>
                <View style={styles.appointmentModalHeader}>
                  <View style={styles.appointmentIconCircle}>
                    <MaterialIcons name="event" size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.appointmentModalTitle}>Request Appointment</Text>
                  <Text style={styles.appointmentModalDesc}>Select a doctor and describe your concern</Text>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Select Doctor</Text>
                  <TouchableOpacity
                    style={styles.doctorSelectButton}
                    onPress={() => setShowDoctorPicker(true)}>
                    <View style={styles.doctorSelectContent}>
                      {selectedDoctor ? (
                        <>
                          <MaterialIcons name={selectedDoctor.icon} size={24} color="#ffb495" />
                          <View style={styles.doctorSelectInfo}>
                            <Text style={styles.doctorSelectName}>{selectedDoctor.name}</Text>
                            <Text style={styles.doctorSelectSpecialty}>{selectedDoctor.specialty}</Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.doctorSelectPlaceholder}>Choose a doctor...</Text>
                      )}
                    </View>
                    <MaterialIcons name="arrow-drop-down" size={28} color="#b37e68" />
                  </TouchableOpacity>
                </View>

                <View style={styles.reasonContainer}>
                  <Text style={styles.pickerLabel}>Reason for Appointment</Text>
                  <TextInput
                    style={styles.reasonTextInput}
                    placeholder="Describe your concern..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={appointmentReason}
                    onChangeText={setAppointmentReason}
                  />
                </View>

                <View style={styles.appointmentModalButtons}>
                  <TouchableOpacity style={styles.appointmentCancelButton} onPress={() => { setAppointmentModal(false); setAppointmentReason(''); setSelectedDoctor(null); }}>
                    <Text style={styles.appointmentCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.appointmentSubmitButton} onPress={requestAppointment}>
                    <MaterialIcons name="send" size={18} color="#FFFFFF" />
                    <Text style={styles.appointmentSubmitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )
      }

      {/* Doctor Picker Modal */}
      {
        showDoctorPicker && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.doctorPickerModal}>
                <View style={styles.doctorPickerHeader}>
                  <Text style={styles.doctorPickerTitle}>Select Doctor</Text>
                  <TouchableOpacity onPress={() => setShowDoctorPicker(false)}>
                    <MaterialIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {DOCTORS.map(doctor => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={[styles.doctorCard, selectedDoctor?.id === doctor.id && styles.doctorCardSelected]}
                    onPress={() => {
                      setSelectedDoctor(doctor);
                      setShowDoctorPicker(false);
                    }}>
                    <View style={styles.doctorCardIconCircle}>
                      <MaterialIcons name={doctor.icon} size={28} color="#ffb495" />
                    </View>
                    <View style={styles.doctorCardInfo}>
                      <Text style={styles.doctorCardName}>{doctor.name}</Text>
                      <Text style={styles.doctorCardSpecialty}>{doctor.specialty}</Text>
                    </View>
                    {selectedDoctor?.id === doctor.id && (
                      <MaterialIcons name="check-circle" size={24} color=" #28a745" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        )
      }

      {
        playingVideo && (
          <UniversalVideoPlayer
            videoUrl={playingVideo}
            onClose={() => setPlayingVideo(null)}
          />
        )
      }

      {/* Custom Success Modal */}
      {
        customSuccessModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MaterialIcons name="check-circle" size={56} color="#10B981" style={{ alignSelf: 'center', marginBottom: 12 }} />
                <Text style={styles.modalTitle}>Success!</Text>
                <Text style={styles.modalDesc}>{customSuccessModal}</Text>
                <TouchableOpacity style={[styles.submitBtn, { marginBottom: 0, marginTop: 8 }]} onPress={() => setCustomSuccessModal(null)}>
                  <Text style={styles.submitBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }

      {/* Custom Error Modal */}
      {
        customErrorModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MaterialIcons name="error" size={56} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 12 }} />
                <Text style={styles.modalTitle}>Error</Text>
                <Text style={styles.modalDesc}>{customErrorModal}</Text>
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#EF4444', marginBottom: 0, marginTop: 8 }]} onPress={() => setCustomErrorModal(null)}>
                  <Text style={styles.submitBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }

      {/* Logout Confirmation Modal */}
      {
        showLogoutModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.logoutModalContent}>
                <View style={styles.logoutIconCircle}>
                  <MaterialIcons name="logout" size={40} color="#FF9800" />
                </View>
                <Text style={styles.logoutModalTitle}>Logout</Text>
                <Text style={styles.logoutModalDesc}>Are you sure you want to logout?</Text>
                <View style={styles.logoutModalButtons}>
                  <TouchableOpacity
                    style={styles.logoutCancelBtn}
                    onPress={() => setShowLogoutModal(false)}
                  >
                    <Text style={styles.logoutCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.logoutConfirmBtn}
                    onPress={() => {
                      setShowLogoutModal(false);
                      handleLogout();
                    }}
                  >
                    <Text style={styles.logoutConfirmText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )
      }
    </View >
  );
}


// Typography System for Habit Tracker and Support
const headingBold = 'JosefinSans-Bold';
const bodyRegular = 'WorkSans-Regular';

// Original font constants for other sections
const headingRegular = getFontFamily('heading', 'regular');
const headingMedium = getFontFamily('heading', 'medium');
const headingBoldOld = getFontFamily('heading', 'bold');
const bodyRegularOld = getFontFamily('body', 'regular');
const bodyMedium = getFontFamily('body', 'medium');
const bodyBold = getFontFamily('body', 'bold');


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', position: 'relative' },
  header: { backgroundColor: '#F5F7FA', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B3B6F', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontFamily: bodyRegular },
  greeting: { color: '#1B3B6F', fontSize: 16, fontFamily: bodyRegular, flexShrink: 1 },
  levelPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  levelText: { color: '#fff', fontSize: 11, fontFamily: bodyRegular },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E74C3C', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', fontFamily: bodyBold },
  icon: { fontSize: 20 },
  progressStrip: { backgroundColor: '#F5F7FA', padding: 12 },
  progressBar: { height: 6, backgroundColor: '#ffe1d5', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#b37e68' },
  progressLabel: { color: '#1B3B6F', fontSize: 12, marginTop: 6, textAlign: 'center', fontFamily: bodyRegular },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#04223e', marginBottom: 20, textAlign: 'center', fontFamily: headingBold },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#ffcbb5', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  videosInCard: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  videosInCardTitle: { fontSize: 16, fontWeight: '700', color: '#1B3B6F', marginBottom: 12, fontFamily: headingMedium },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  levelBadgeText: { color: '#fff', fontSize: 12, fontFamily: bodyRegular },
  levelName: { fontSize: 18, color: '#1B3B6F', marginBottom: 4, fontFamily: bodyRegular },
  levelDuration: { fontSize: 14, color: '#666', fontFamily: bodyRegular },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 17, color: '#04223e', marginBottom: 12, fontFamily: bodyRegular },
  cardTitleBold: { fontSize: 17, color: '#063159', marginBottom: 12, fontFamily: 'JosefinSans-Bold' },
  dateText: { fontSize: 12, color: '#66483c', marginBottom: 12, fontFamily: bodyRegular },
  videoTile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#F6F7FB', borderRadius: 12, marginBottom: 12 },
  videoThumb: { width: 60, height: 60, backgroundColor: '#1B3B6F', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  orderBadge: { color: '#00A8A8', fontSize: 20, fontFamily: headingBold },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 14, color: '#1B3B6F', fontFamily: headingBold },
  videoDuration: { fontSize: 12, color: '#666', marginTop: 2, fontFamily: bodyRegular },
  microCopy: { fontSize: 11, color: '#999', marginTop: 4, fontFamily: bodyRegular },
  videoActions: { flexDirection: 'column', gap: 6 },
  playBtn: { backgroundColor: '#00A8A8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 80 },
  playBtnText: { color: '#fff', fontSize: 13, textAlign: 'center', fontFamily: headingBold },
  completeBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 80 },
  completeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', fontFamily: bodyBold },
  routineItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  routineIcon: { fontSize: 20 },
  routineContent: { flex: 1 },
  routineTitle: { fontSize: 14, fontWeight: '600', color: '#1B3B6F', fontFamily: headingMedium },
  routineDesc: { fontSize: 12, color: '#666', marginTop: 2, fontFamily: bodyRegular },
  checkBtn: { backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  checkBtnText: { color: '#fff', fontSize: 12, fontWeight: '700', fontFamily: bodyBold },
  habitItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, backgroundColor: '#fff8f4', borderRadius: 10, marginBottom: 6 },
  habitTitle: { fontSize: 13, color: '#04223e', fontFamily: headingBold, marginBottom: 1 },
  habitSchedule: { fontSize: 10, color: '#666', fontFamily: bodyRegular },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 2 },
  navIcon: { fontSize: 24, marginBottom: 2 },
  navLabel: { fontSize: 10, color: '#999', marginTop: 2, textAlign: 'center', fontFamily: bodyRegular },
  navActive: { color: '#ffb495' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '85%' },
  completionIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, color: '#1B3B6F', marginBottom: 12, textAlign: 'center', letterSpacing: 0.3, fontFamily: bodyRegular },
  modalDesc: { fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center', lineHeight: 20, fontFamily: bodyRegular },
  qaSection: { marginBottom: 20 },
  qaTitle: { fontSize: 16, fontWeight: '700', color: '#1B3B6F', marginBottom: 12, textAlign: 'center', fontFamily: headingMedium },
  qaButtons: { flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center' },
  yesBtn: { flex: 1, backgroundColor: '#27AE60', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  noBtn: { flex: 1, backgroundColor: '#E74C3C', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qaText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', fontFamily: bodyBold },
  closeBtn: { backgroundColor: '#F3F4F6', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginTop: 8 },
  closeBtnWithMargin: { backgroundColor: '#F3F4F6', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginTop: 16 },
  closeBtnText: { color: '#4B5563', fontSize: 14, textAlign: 'center', fontFamily: bodyRegular },
  fab: { position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#516f8b', justifyContent: 'center', alignItems: 'center', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabText: { fontSize: 24 },
  stepCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 8, marginBottom: 6, borderWidth: 1, borderColor: '#ffcbb5', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#516f8b', color: '#fff', fontFamily: headingMedium, fontSize: 13, textAlign: 'center', lineHeight: 28, overflow: 'hidden' },
  stepTitle: { flex: 1, fontSize: 15, color: '#04223e', letterSpacing: 0.1, fontFamily: headingBold },
  checkMark: { fontSize: 18, color: '#28a745', fontWeight: '800' },
  stepContent: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ffcbb5' },
  stepDesc: { fontSize: 14, color: '#516f8b', marginBottom: 8, lineHeight: 20, fontWeight: '500' },
  stepSectionTitle: { fontSize: 16, color: '#1B3B6F', marginTop: 12, marginBottom: 8, paddingLeft: 8, borderLeftWidth: 4, borderLeftColor: '#00A8A8', fontFamily: headingBold },
  stepContentText: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 12 },
  videoBox: { backgroundColor: '#1B3B6F', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  videoIcon: { fontSize: 24 },
  videoText: { color: '#00A8A8', fontSize: 14, fontWeight: '700', flex: 1 },
  doneBtn: { backgroundColor: '#27AE60', padding: 12, borderRadius: 8 },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  nextBtn: { backgroundColor: '#516f8b', padding: 16, borderRadius: 12, marginTop: 16 },
  nextBtnText: { color: '#fff', fontSize: 16, textAlign: 'center', fontFamily: headingBold },
  habitSubtitle: { fontSize: 11, color: '#66483c', marginBottom: 10, fontFamily: bodyRegular },
  habitContent: { flex: 1 },
  habitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  scheduleBadge: { backgroundColor: '#516f8b', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  scheduleBadgeRandom: { backgroundColor: '#ffc107' },
  scheduleBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', fontFamily: bodyBold },
  habitCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#28a745', justifyContent: 'center', alignItems: 'center' },
  habitCheckDone: { backgroundColor: '#28a745', borderColor: '#28a745' },
  habitCheckText: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
  qaInput: { backgroundColor: '#F5F7FA', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 13, color: '#1B3B6F', minHeight: 80, textAlignVertical: 'top', marginBottom: 12, fontFamily: bodyRegular },
  submitBtn: { backgroundColor: '#28a745', padding: 16, borderRadius: 10, marginTop: 8, marginBottom: 100 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, textAlign: 'center', fontFamily: headingBold },
  workshopSubtitle: { fontSize: 12, color: '#999', marginBottom: 12, fontFamily: bodyRegular },
  workshopCard: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 2, borderColor: '#00A8A8' },
  workshopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  workshopTime: { fontSize: 11, color: '#00A8A8', fontFamily: headingBold },
  workshopTitle: { fontSize: 14, color: '#1B3B6F', marginBottom: 4, fontFamily: headingBold },
  appointmentTitle: { fontSize: 14, color: '#1B3B6F', marginBottom: 4, fontFamily: 'WorkSans-Regular' },
  workshopDesc: { fontSize: 11, color: '#666', marginBottom: 6, fontFamily: bodyRegular },
  joinBtn: { backgroundColor: '#00A8A8', padding: 10, borderRadius: 8 },
  joinBtnText: { color: '#fff', fontSize: 13, textAlign: 'center', fontFamily: headingBold },
  noWorkshops: { fontSize: 14, color: '#999', textAlign: 'center', padding: 20, fontFamily: bodyRegular },
  noVideos: { fontSize: 14, color: '#6B7280', textAlign: 'center', padding: 20, fontFamily: bodyRegular },
  levelStatus: { fontSize: 12, color: '#27AE60', fontWeight: '700', marginTop: 8, fontFamily: bodyBold },
  levelStatusLocked: { fontSize: 12, color: '#999', fontWeight: '700', marginTop: 8, fontFamily: bodyBold },
  menuContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', position: 'absolute', bottom: 0 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  menuAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#00A8A8', justifyContent: 'center', alignItems: 'center' },
  menuAvatarText: { color: '#FFFFFF', fontSize: 18, fontFamily: bodyRegular },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 17, fontFamily: bodyRegular, color: '#1B3B6F', marginBottom: 4 },
  menuLevelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  menuLevelText: { color: '#fff', fontSize: 11, fontFamily: bodyRegular },
  menuStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  menuStatItem: { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10, alignItems: 'center' },
  menuStatValue: { fontSize: 22, fontFamily: bodyRegular, color: '#1B3B6F', marginBottom: 2 },
  menuStatLabel: { fontSize: 11, color: '#6B7280', fontFamily: bodyRegular },
  menuDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 10, marginBottom: 8 },
  menuItemIcon: { fontSize: 24 },
  menuItemText: { fontSize: 15, color: '#1B3B6F', fontFamily: bodyRegular, flex: 1 },
  logoutBtn: { backgroundColor: '#EF4444', padding: 14, borderRadius: 10, marginTop: 8 },
  logoutBtnText: { color: '#fff', fontSize: 15, fontFamily: bodyRegular, textAlign: 'center' },
  closeMenuBtn: { backgroundColor: '#F3F4F6', padding: 14, borderRadius: 10, marginTop: 8 },
  closeMenuBtnText: { color: '#6B7280', fontSize: 15, fontFamily: bodyRegular, textAlign: 'center' },
  versionText: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 8, fontFamily: bodyRegular },
  startLevelBtn: { backgroundColor: '#00A8A8', padding: 16, borderRadius: 12, marginTop: 16 },
  startLevelBtnText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', fontFamily: bodyRegular },
  habitDesc: { fontSize: 11, color: '#666', marginTop: 1, fontFamily: bodyRegular },
  successModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32, width: '85%', alignItems: 'center' },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1B3B6F', marginBottom: 12, textAlign: 'center', fontFamily: headingBold },
  successDesc: { fontSize: 16, color: '#666', marginBottom: 8, textAlign: 'center', lineHeight: 24, fontFamily: bodyRegular },
  successDate: { fontSize: 13, color: '#00A8A8', fontWeight: '600', marginBottom: 24, textAlign: 'center', fontFamily: bodyMedium },
  successBtn: { backgroundColor: '#28a745', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, width: '100%' },
  successBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', fontFamily: headingBold },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginBottom: 8
  },
  profileLabel: { fontSize: 12, color: '#6B7280', fontFamily: bodyRegular, textTransform: 'uppercase', letterSpacing: 0.5 },
  profileValue: { fontSize: 14, color: '#1B3B6F', fontFamily: bodyRegular },
  profileLevelItem: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  profileLevelText: { fontSize: 18, color: '#1B3B6F', fontFamily: bodyRegular, marginTop: 4 },
  profileLevelSubtext: { fontSize: 14, color: '#00A8A8', fontFamily: bodyRegular, marginTop: 2 },
  profileNote: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 12, marginBottom: 8, fontStyle: 'italic', fontFamily: bodyRegular },
  progressStatsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  progressStatBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  progressStatValue: { fontSize: 22, color: '#1B3B6F', marginBottom: 2, fontFamily: bodyRegular },
  progressStatLabel: { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: bodyRegular },
  levelProgressBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE'
  },
  levelProgressTitle: { fontSize: 12, color: '#0369A1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: bodyRegular },
  levelProgressDesc: { fontSize: 13, color: '#1B3B6F', marginBottom: 4, textAlign: 'center', fontFamily: bodyRegular },
  levelProgressDays: { fontSize: 12, color: '#64748B', fontFamily: bodyRegular },
  faqItem: { marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  faqQuestion: { fontSize: 14, color: '#1B3B6F', flex: 1, paddingRight: 8, fontFamily: headingBold },
  faqAnswer: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', fontFamily: bodyRegular },
  appointmentBox: { backgroundColor: '#F5F7FA', padding: 16, borderRadius: 10, alignItems: 'center' },
  appointmentText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 12, lineHeight: 18, fontFamily: bodyRegular },
  qaCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 5 },
  qaCardLabel: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', fontFamily: headingBold },
  qaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  qaBadgeText: { color: '#FFF', fontSize: 12, fontFamily: headingBold },
  qaCardQuestion: { fontSize: 14, color: '#1B3B6F', marginBottom: 8, fontFamily: 'WorkSans-Regular' },
  qaCardDate: { fontSize: 12, color: '#6B7280', marginBottom: 8, fontFamily: bodyRegular },
  qaAnswerBox: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginTop: 8 },
  qaAnswerLabel: { fontSize: 12, color: '#10B981', marginBottom: 6, fontFamily: headingBold },
  qaAnswerText: { fontSize: 14, color: '#1B3B6F', marginBottom: 6, lineHeight: 20, fontFamily: bodyRegular },
  qaAnswerDate: { fontSize: 11, color: '#6B7280', fontStyle: 'italic', fontFamily: bodyRegular },
  welcomeBanner: { borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  bannerGradient: { backgroundColor: '#1B3B6F', padding: 12, alignItems: 'center' },
  bannerTitle: {
    fontSize: 16,
    fontFamily: 'JosefinSans-Bold',
    color: '#E5E7EB',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  bannerSubtitle: { fontSize: 11, color: '#E5E7EB', marginBottom: 8, textAlign: 'center', fontFamily: 'WorkSans-Regular' },
  bannerStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bannerStatItem: { alignItems: 'center' },
  bannerStatValue: { fontSize: 18, color: '#FFD700', marginBottom: 2, fontFamily: headingBold },
  bannerStatLabel: { fontSize: 9, color: '#E5E7EB', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: bodyRegular },
  bannerDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickActionCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  quickActionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickActionTitle: { fontSize: 12, color: '#1B3B6F', marginBottom: 2, fontFamily: headingBold },
  quickActionDesc: { fontSize: 9, color: '#6B7280', fontFamily: bodyRegular },
  shareCard: { backgroundColor: '#fff8f4', padding: 10, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: '#ffcbb5', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, shadowColor: '#b37e68', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  shareCardTitle: { fontFamily: 'JosefinSans-Bold', fontSize: 14, color: '#04223e' },
  shareCardDesc: { fontFamily: 'WorkSans-Regular', fontSize: 11, color: '#516f8b' },
  luxuryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  luxuryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  luxuryCardTitle: { fontFamily: 'JosefinSans-Bold', fontSize: 18, color: '#063159', letterSpacing: 0.2 },
  premiumWorkshopCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#b37e68', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  workshopBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  premiumWorkshopTitle: { fontSize: 14, color: '#1B3B6F', marginBottom: 6, letterSpacing: 0.1, fontFamily: headingBold },
  premiumJoinBtn: { backgroundColor: '#063159', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyStateText: { fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 2, fontFamily: headingBold },
  emptyStateSubtext: { fontSize: 12, color: '#9CA3AF', fontFamily: bodyRegular },
  incompleteTasksList: { backgroundColor: '#FFF5F5', borderRadius: 12, padding: 16, marginVertical: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  incompleteTaskItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  incompleteTaskText: { fontSize: 15, color: '#1B3B6F', flex: 1, fontFamily: bodyRegular },
  expandedContent: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  logoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoutModalTitle: {
    fontSize: 24,
    fontFamily: headingBold,
    color: '#1B3B6F',
    marginBottom: 12,
  },
  logoutModalDesc: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: bodyRegular,
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: headingBold,
  },
  logoutConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: headingBold,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  appointmentModalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '90%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  appointmentModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appointmentIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffb495',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: ' #b37e68',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appointmentModalTitle: {
    fontSize: 22,
    color: '#1B3B6F',
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: headingBold,
  },
  appointmentModalDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: bodyRegular,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 15,
    color: '#1B3B6F',
    marginBottom: 10,
    letterSpacing: 0.2,
    fontFamily: headingBold,
  },
  doctorSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#ffb495',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    shadowColor: ' #b37e68',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorSelectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  doctorSelectInfo: {
    flex: 1,
  },
  doctorSelectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B3B6F',
    marginBottom: 2,
    fontFamily: headingMedium,
  },
  doctorSelectSpecialty: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: bodyRegular,
  },
  doctorSelectPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
    fontFamily: bodyRegular,
  },
  reasonContainer: {
    marginBottom: 24,
  },
  reasonTextInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1B3B6F',
    minHeight: 100,
    backgroundColor: '#F9FAFB',
    fontWeight: '500',
    fontFamily: bodyRegular,
  },
  appointmentModalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  appointmentCancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  appointmentCancelButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: headingBold,
  },
  appointmentSubmitButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#28a745 - 20%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentSubmitButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: headingBold,
  },
  doctorPickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  doctorPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  doctorPickerTitle: {
    fontSize: 20,
    color: '#1B3B6F',
    letterSpacing: 0.3,
    fontFamily: headingBold,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  doctorCardSelected: {
    backgroundColor: '#E0F7F7',
    borderColor: '#ffb495',
  },
  doctorCardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: ' #b37e68',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorCardInfo: {
    flex: 1,
  },
  doctorCardName: {
    fontSize: 16,
    color: '#1B3B6F',
    marginBottom: 4,
    fontFamily: headingBold,
  },
  doctorCardSpecialty: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: bodyRegular,
  },

});
