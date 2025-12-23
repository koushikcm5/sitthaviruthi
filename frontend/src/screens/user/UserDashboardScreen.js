import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attendanceAPI, authAPI } from '../../services/api';
import { getFontFamily } from '../../styles/fonts';

const headingBold = 'JosefinSans-Bold';
const bodyRegular = 'WorkSans-Regular';

export default function UserDashboardScreen({ route, navigation }) {
  const { username } = route.params;
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelName, setLevelName] = useState('NarKarma Viruthi');
  const [monthlyProgress, setMonthlyProgress] = useState(0);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [monthsCompleted, setMonthsCompleted] = useState(0);

  useEffect(() => {
    loadUserData();
    checkDailyAttendance();
  }, []);

  const loadUserData = async () => {
    try {
      const level = await AsyncStorage.getItem(`${username}_level`);
      const progress = await AsyncStorage.getItem(`${username}_progress`);
      const month = await AsyncStorage.getItem(`${username}_month`);

      if (level) {
        const lvl = parseInt(level);
        setCurrentLevel(lvl);
        setLevelName(getLevelName(lvl));
      }
      if (progress) setMonthlyProgress(parseInt(progress));

      await loadAttendanceHistory();

      const completedMonths = await AsyncStorage.getItem(`${username}_monthsCompleted`);
      if (completedMonths) setMonthsCompleted(parseInt(completedMonths));

      const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setCurrentMonth(currentMonthYear);

      if (month !== currentMonthYear) {
        await checkMonthCompletion(month, currentMonthYear);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const data = await attendanceAPI.getUserAttendance(username);
      const history = data.map(att => ({
        date: new Date(att.date).toLocaleDateString(),
        attended: att.attended,
        level: att.level,
        timestamp: att.date
      }));
      setAttendanceHistory(history);
    } catch (error) {
      console.log('Error loading attendance history:', error);
    }
  };

  const getLevelName = (level) => {
    const levels = ['NarKarma Viruthi', 'Suya Viruthi', 'Yoga Viruthi'];
    return levels[level - 1] || 'Yoga Viruthi';
  };

  const checkMonthCompletion = async (oldMonth, newMonth) => {
    if (oldMonth && oldMonth !== newMonth) {
      const newMonthsCompleted = monthsCompleted + 1;
      await AsyncStorage.setItem(`${username}_monthsCompleted`, newMonthsCompleted.toString());
      setMonthsCompleted(newMonthsCompleted);

      if (newMonthsCompleted % 4 === 0 && currentLevel < 3) {
        const newLevel = currentLevel + 1;
        const newLevelName = getLevelName(newLevel);
        await AsyncStorage.setItem(`${username}_level`, newLevel.toString());
        setCurrentLevel(newLevel);
        setLevelName(newLevelName);
        Alert.alert('Level Up!', `Congratulations! You achieved ${newLevelName}`);
      }

      await AsyncStorage.setItem(`${username}_progress`, '0');
      await AsyncStorage.setItem(`${username}_month`, newMonth);
      setMonthlyProgress(0);
    } else {
      await AsyncStorage.setItem(`${username}_month`, newMonth);
    }
  };

  const checkDailyAttendance = async () => {
    const today = new Date().toDateString();
    const lastAttendance = await AsyncStorage.getItem(`${username}_lastAttendance`);

    if (lastAttendance !== today) {
      setShowAttendanceModal(true);
    }
  };

  const handleModalDismiss = async () => {
    // Mark as absent if user closes modal without selecting
    await handleAttendance(false);
  };

  const handleAttendance = async (attended) => {
    const today = new Date().toDateString();

    try {
      await attendanceAPI.markAttendance(attended);
      await AsyncStorage.setItem(`${username}_lastAttendance`, today);

      const newProgress = attended ? monthlyProgress + 1 : monthlyProgress;
      await AsyncStorage.setItem(`${username}_progress`, newProgress.toString());
      setMonthlyProgress(newProgress);

      await loadAttendanceHistory();
      Alert.alert('Success', 'Attendance marked successfully');
    } catch (error) {
      console.log('Error saving attendance:', error);
      Alert.alert('Error', error.message || 'Failed to mark attendance');
    }

    setShowAttendanceModal(false);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigation.navigate('Login');
  };

  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Welcome, {username}</Text>
          <Text style={styles.headerSubtitle}>{levelName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>Current Level</Text>
          <Text style={styles.levelValue}>{levelName}</Text>
          <Text style={styles.levelNumber}>Level {currentLevel} / 3</Text>
          <Text style={styles.monthsInfo}>{monthsCompleted % 4} / 4 months completed</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((monthsCompleted % 4) / 4) * 100}%` }]} />
          </View>
          <Text style={styles.levelInfo}>Complete 4 months to advance to next level</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Progress - {currentMonth}</Text>
          <Text style={styles.cardValue}>{monthlyProgress} days attended</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(monthlyProgress / getDaysInMonth()) * 100}%` }]} />
          </View>
          <Text style={styles.progressInfo}>{getDaysInMonth() - monthlyProgress} days remaining this month</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          {attendanceHistory.length === 0 ? (
            <Text style={styles.emptyText}>No attendance records yet</Text>
          ) : (
            attendanceHistory.slice().reverse().map((record, index) => (
              <View key={index} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyDate}>{record.date}</Text>
                  <Text style={styles.historyLevel}>Level {record.level}</Text>
                </View>
                <View style={[styles.statusBadge, record.attended ? styles.attendedBadge : styles.absentBadge]}>
                  <Text style={styles.statusText}>{record.attended ? 'Attended' : 'Absent'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAttendanceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Session Attendance</Text>
            <Text style={styles.modalText}>Did you attend today's session?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.yesButton]}
                onPress={() => handleAttendance(true)}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.noButton]}
                onPress={() => handleAttendance(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Font shortcuts for this file (user dashboard only)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 22,
    color: '#D4AF37',
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 5,
    letterSpacing: 1,
    fontFamily: bodyRegular,
  },
  logoutButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#000000',
    fontSize: 13,
    fontFamily: bodyRegular,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  levelCard: {
    backgroundColor: '#1A1A1A',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 10,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
  levelValue: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: bodyRegular,
    textAlign: 'center',
  },
  levelNumber: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 8,
    fontFamily: bodyRegular,
  },
  monthsInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 15,
    fontFamily: bodyRegular,
  },
  levelInfo: {
    fontSize: 12,
    color: '#999999',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1A1A1A',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  cardTitle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 10,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
  cardValue: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 15,
    fontFamily: bodyRegular,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#333333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 5,
  },
  progressInfo: {
    fontSize: 12,
    color: '#999999',
    marginTop: 10,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#D4AF37',
    marginBottom: 16,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
    marginTop: 20,
    fontFamily: bodyRegular,
  },
  historyItem: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  historyDate: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: bodyRegular,
  },
  historyLevel: {
    fontSize: 13,
    color: '#D4AF37',
    marginTop: 5,
    fontFamily: bodyRegular,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  attendedBadge: {
    backgroundColor: '#D4AF37',
  },
  absentBadge: {
    backgroundColor: '#666666',
  },
  statusText: {
    color: '#000000',
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    padding: 32,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  modalTitle: {
    fontSize: 26,
    color: '#D4AF37',
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
  modalText: {
    fontSize: 15,
    color: '#999999',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: bodyRegular,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#D4AF37',
  },
  noButton: {
    backgroundColor: '#666666',
  },
  modalButtonText: {
    color: '#000000',
    fontSize: 16,
    letterSpacing: 0.5,
    fontFamily: bodyRegular,
  },
});
