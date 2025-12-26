import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { notificationService } from '../../services/notificationService';
import { authAPI, attendanceAPI, adminAPI, contentAPI } from '../../services/api';
import { API_URL } from '../../../config';

export default function AdminDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, attended: 0, absent: 0 });
  const [progress, setProgress] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredProgress, setFilteredProgress] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [calendarModal, setCalendarModal] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentModal, setAppointmentModal] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [showScheduleDatePicker, setShowScheduleDatePicker] = useState(false);
  const [showScheduleTimePicker, setShowScheduleTimePicker] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [qaList, setQaList] = useState([]);
  const [qaModal, setQaModal] = useState(null);
  const [qaAnswer, setQaAnswer] = useState('');
  const [userDetailModal, setUserDetailModal] = useState(null);
  const [userAttendanceDetails, setUserAttendanceDetails] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [expandedQA, setExpandedQA] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  const [healingUploads, setHealingUploads] = useState([]);

  useEffect(() => {
    loadData();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    const username = await AsyncStorage.getItem('username');
    const count = await notificationService.getUnreadCount(username);
    setUnreadCount(count);
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    }
    if (activeTab === 'qa') {
      loadQA();
    }
    if (activeTab === 'pending') {
      loadPendingUsers();
    }
    if (activeTab === 'healing') {
      loadHealingUploads();
    }
  }, [activeTab]);

  const loadHealingUploads = async () => {
    try {
      const data = await contentAPI.getHealingUploads();
      setHealingUploads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Error loading healing uploads:', error);
      setHealingUploads([]);
    }
  };

  // Refresh unread count when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUnreadCount();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAppointments = async () => {
    try {
      const data = await adminAPI.getAllAppointments();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filtered = data.filter(apt => new Date(apt.requestedDate) >= thirtyDaysAgo);
      setAppointments(filtered);
    } catch (error) {
      setAppointments([]);
    }
  };

  const loadQA = async () => {
    try {
      const data = await adminAPI.getAllQA();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filtered = data.filter(qa => new Date(qa.createdAt) >= thirtyDaysAgo);
      setQaList(filtered);
    } catch (error) {
      setQaList([]);
    }
  };

  const answerQuestion = async (id) => {
    if (!qaAnswer.trim()) {
      Alert.alert('Error', 'Please enter your answer');
      return;
    }
    try {
      await adminAPI.answerQuestion(id, qaAnswer);
      // Notify user of answer
      await notificationService.notifyQuestionAnswered(qaModal.username, qaModal.question);

      setSuccessAlert('Answer submitted successfully!');
      setQaModal(null);
      setQaAnswer('');
      loadQA();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answer');
    }
  };

  const approveAppointment = async (id) => {
    const formatted = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}T${String(scheduleDate.getHours()).padStart(2, '0')}:${String(scheduleDate.getMinutes()).padStart(2, '0')}:00`;
    try {
      await adminAPI.approveAppointment(id, { scheduledDate: formatted, adminNotes });
      // Notify user of approval
      await notificationService.notifyAppointmentScheduled(appointmentModal.username, formatted);

      setSuccessAlert('Appointment approved successfully!');
      setAppointmentModal(null);
      setAdminNotes('');
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve appointment');
    }
  };

  const rejectAppointment = async (id) => {
    try {
      await adminAPI.rejectAppointment(id, { adminNotes });
      // Notify user of rejection
      await notificationService.notifyAppointmentRejected(appointmentModal.username, adminNotes);

      setSuccessAlert('Appointment rejected');
      setAppointmentModal(null);
      setAdminNotes('');
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject appointment');
    }
  };

  const onScheduleDateChange = (event, selectedDate) => {
    setShowScheduleDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(scheduleDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setScheduleDate(newDate);
    }
  };

  const onScheduleTimeChange = (event, selectedTime) => {
    setShowScheduleTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      const newDate = new Date(scheduleDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduleDate(newDate);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const data = await authAPI.getPendingUsers();
      setPendingUsers(data);
    } catch (error) {
      setPendingUsers([]);
    }
  };

  const approveUserAccount = async (username) => {
    try {
      await authAPI.approveUser(username);
      // Notify user of approval
      await notificationService.notifyAccountApproved(username);

      setSuccessAlert(`User '${username}' has been approved successfully! They can now login to the app.`);
      loadPendingUsers();
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve user');
    }
  };

  const loadData = async () => {
    try {
      const progressData = await adminAPI.getAllProgress();
      setProgress(progressData);
      setFilteredProgress(progressData);

      const allUsers = await attendanceAPI.getAllUsers();
      setUsers(allUsers);

      const allAttendance = await attendanceAPI.getAllAttendance();
      setAttendanceRecords(allAttendance);

      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = allAttendance.filter(a => a?.date?.startsWith(today));
      const attendedToday = todayAttendance.filter(a => a?.attended).length;
      const pendingToday = allUsers.length - todayAttendance.length;

      setStats({
        totalUsers: allUsers.length,
        attended: attendedToday,
        absent: Math.max(0, pendingToday)
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      setStats({ totalUsers: 0, attended: 0, absent: 0 });
    }
  };

  const applyFilters = () => {
    let filtered = [...progress];

    if (searchText) {
      filtered = filtered.filter(p => p.username.toLowerCase().includes(searchText.toLowerCase()));
    }

    if (filterStatus === 'attended') {
      filtered = filtered.filter(p => p.allTasksCompleted);
    } else if (filterStatus === 'absent') {
      // Show users who haven't marked attendance today
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceRecords.filter(a => a.date.startsWith(today));
      const attendedUsernames = todayAttendance.map(a => a.username);
      const allUsernames = users.map(u => u.username);
      const notAttendedUsernames = allUsernames.filter(u => !attendedUsernames.includes(u));
      filtered = filtered.filter(p => notAttendedUsernames.includes(p.username));
    }

    setFilteredProgress(filtered);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
    setFilterStatus('all');
    setFilteredProgress(progress);
    setShowFilters(false);
  };

  const deleteUser = async (username) => {
    try {
      await authAPI.deleteUser(username);

      setDeleteModal(null);
      // Remove from local state immediately
      setProgress(progress.filter(p => p.username !== username));
      setFilteredProgress(filteredProgress.filter(p => p.username !== username));
      setUsers(users.filter(u => u.username !== username));
      // Reload all data
      await loadData();
    } catch (error) {
      setErrorModal('Error deleting user');
    }
  };

  const updateAttendance = async (id, attended) => {
    try {
      await attendanceAPI.updateAttendance(id, attended);

      setEditModal(null);
      await loadData();
    } catch (error) {
      setErrorModal('Failed to update attendance');
    }
  };



  const renderOverview = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.attended}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.absent}</Text>
          <Text style={styles.statLabel}>Pending Today</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>User Progress</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
            <MaterialIcons name="filter-list" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              let filtered = progress.filter(p => p.username.toLowerCase().includes(text.toLowerCase()));
              if (filterStatus === 'attended') {
                filtered = filtered.filter(p => p.allTasksCompleted);
              } else if (filterStatus === 'absent') {
                const today = new Date().toISOString().split('T')[0];
                const todayAttendance = attendanceRecords.filter(a => a.date.startsWith(today));
                const attendedUsernames = todayAttendance.map(a => a.username);
                const allUsernames = users.map(u => u.username);
                const notAttendedUsernames = allUsernames.filter(u => !attendedUsernames.includes(u));
                filtered = filtered.filter(p => notAttendedUsernames.includes(p.username));
              }
              setFilteredProgress(filtered);
            }}
          />
        </View>

        {filteredProgress.map((p, i) => {
          const user = users.find(u => u.username === p.username);
          const userAttendance = attendanceRecords.filter(a => a.username === p.username);

          return (
            <View key={i} style={styles.progressItem}>
              {/* Avatar */}
              <TouchableOpacity style={styles.userAvatarSmall} onPress={() => {
                if (user?.profilePictureUrl) {
                  const fullUrl = user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${API_URL.replace('/api/v1', '')}${user.profilePictureUrl}`;
                  setSelectedImage(fullUrl);
                }
              }}>
                {user?.profilePictureUrl ? (
                  <Image
                    source={{ uri: user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${API_URL.replace('/api/v1', '')}${user.profilePictureUrl}` }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <Text style={styles.userAvatarTextSmall}>{user?.name?.[0]?.toUpperCase() || p.username?.[0]?.toUpperCase()}</Text>
                )}
              </TouchableOpacity>

              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={styles.progressUser}>{p.username}</Text>
                <View style={styles.progressBadges}>
                  <View style={[styles.badgePill, p.videoCompleted ? styles.badgeActive : styles.badgeInactive]}>
                    <MaterialIcons name={p.videoCompleted ? "check-circle" : "radio-button-unchecked"} size={10} color={p.videoCompleted ? "#27AE60" : "#9CA3AF"} />
                    <Text style={[styles.badgeText, p.videoCompleted ? styles.badgeTextActive : styles.badgeTextInactive]}>Video</Text>
                  </View>
                  <View style={[styles.badgePill, p.routineCompleted ? styles.badgeActive : styles.badgeInactive]}>
                    <MaterialIcons name={p.routineCompleted ? "check-circle" : "radio-button-unchecked"} size={10} color={p.routineCompleted ? "#27AE60" : "#9CA3AF"} />
                    <Text style={[styles.badgeText, p.routineCompleted ? styles.badgeTextActive : styles.badgeTextInactive]}>Routine</Text>
                  </View>
                  <View style={[styles.badgePill, p.habitsCompleted ? styles.badgeActive : styles.badgeInactive]}>
                    <MaterialIcons name={p.habitsCompleted ? "check-circle" : "radio-button-unchecked"} size={10} color={p.habitsCompleted ? "#27AE60" : "#9CA3AF"} />
                    <Text style={[styles.badgeText, p.habitsCompleted ? styles.badgeTextActive : styles.badgeTextInactive]}>Habits</Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.calendarBtn} onPress={() => setCalendarModal({ username: p.username, records: userAttendance })}>
                  <MaterialIcons name="calendar-today" size={18} color="#27AE60" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal({ username: p.username, records: userAttendance })}>
                  <MaterialIcons name="edit" size={18} color="#b37e68" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderContent = () => (
    <View>
      <TouchableOpacity style={styles.contentSection} onPress={() => navigation.navigate('AdminContentManager', { initialTab: 'videos' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="play-circle-outline" size={20} color="#ffb495" />
          <Text style={styles.contentSectionTitle}>Videos</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.contentSection} onPress={() => navigation.navigate('AdminContentManager', { initialTab: 'manifestation' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="auto-awesome" size={20} color="#ffb495" />
          <Text style={styles.contentSectionTitle}>Manifestation</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.contentSection} onPress={() => navigation.navigate('AdminContentManager', { initialTab: 'habits' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="task-alt" size={20} color="#ffb495" />
          <Text style={styles.contentSectionTitle}>Habits</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.contentSection} onPress={() => navigation.navigate('AdminContentManager', { initialTab: 'workshops' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="event" size={20} color="#ffb495" />
          <Text style={styles.contentSectionTitle}>Workshops</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const loadUserDetails = async (user) => {
    try {
      const data = await attendanceAPI.getUserAttendance(user.username);
      setUserAttendanceDetails(Array.isArray(data) ? data : []);
      setUserDetailModal(user);
    } catch (error) {
      console.log('Error loading user details:', error);
      setUserAttendanceDetails([]);
    }
  };

  const renderPendingUsers = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Pending Approvals ({pendingUsers.length})</Text>
      {pendingUsers.length > 0 ? (
        pendingUsers.map((user, i) => (
          <View key={i} style={styles.pendingUserItem}>
            <TouchableOpacity style={styles.userAvatar} onPress={() => {
              if (user.profilePictureUrl) {
                const fullUrl = user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${API_URL.replace('/api/v1', '')}${user.profilePictureUrl}`;
                setSelectedImage(fullUrl);
              }
            }}>
              {user.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${API_URL.replace('/api/v1', '')}${user.profilePictureUrl}` }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <Text style={styles.userAvatarText}>{user.name[0]}</Text>
              )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetail}>{user.email}</Text>
              <Text style={styles.userDetail}>{user.username}</Text>
              <Text style={styles.userDetail}>Registered: {new Date(user.createdAt).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity style={styles.approveUserBtn} onPress={() => approveUserAccount(user.username)}>
              <MaterialIcons name="check-circle" size={24} color="#ffb495" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No pending approvals</Text>
      )}
    </View>
  );

  const renderUsers = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Registered Users ({users.length})</Text>
      {users.map((user, i) => (
        <TouchableOpacity key={i} style={styles.userItem} onPress={() => loadUserDetails(user)}>
          <TouchableOpacity style={styles.userAvatar} onPress={() => {
            if (user.profilePictureUrl) {
              const fullUrl = user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${API_URL.replace('/api/v1', '')}${user.profilePictureUrl}`;
              setSelectedImage(fullUrl);
            }
          }}>
            {user.profilePictureUrl ? (
              <Image
                source={{ uri: user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${API_URL.replace('/api/v1', '')}${user.profilePictureUrl}` }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <Text style={styles.userAvatarText}>{user.name[0]}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDetail}>{user.email}</Text>
            <Text style={styles.userLevel}>Level {user.level}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.viewBtn} onPress={() => loadUserDetails(user)}>
              <MaterialIcons name="visibility" size={20} color="#ffb495" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => setDeleteModal(user.username)}>
              <MaterialIcons name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAppointments = () => {
    const filteredAppointments = selectedDoctorFilter === 'all'
      ? appointments
      : appointments.filter(apt => apt.doctorName === selectedDoctorFilter);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Appointment Requests</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={styles.doctorFilterRow}>
            <TouchableOpacity
              style={[styles.doctorFilterBtn, selectedDoctorFilter === 'all' && styles.doctorFilterBtnActive]}
              onPress={() => setSelectedDoctorFilter('all')}>
              <Text style={[styles.doctorFilterText, selectedDoctorFilter === 'all' && styles.doctorFilterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doctorFilterBtn, selectedDoctorFilter === 'Dr. Vivekananthan (Yoga)' && styles.doctorFilterBtnActive]}
              onPress={() => setSelectedDoctorFilter('Dr. Vivekananthan (Yoga)')}>
              <Text style={[styles.doctorFilterText, selectedDoctorFilter === 'Dr. Vivekananthan (Yoga)' && styles.doctorFilterTextActive]}>Yoga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doctorFilterBtn, selectedDoctorFilter === 'Dr. Vivekananthan (Meditation)' && styles.doctorFilterBtnActive]}
              onPress={() => setSelectedDoctorFilter('Dr. Vivekananthan (Meditation)')}>
              <Text style={[styles.doctorFilterText, selectedDoctorFilter === 'Dr. Vivekananthan (Meditation)' && styles.doctorFilterTextActive]}>Meditation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doctorFilterBtn, selectedDoctorFilter === 'Dr. Vivekananthan (Wellness)' && styles.doctorFilterBtnActive]}
              onPress={() => setSelectedDoctorFilter('Dr. Vivekananthan (Wellness)')}>
              <Text style={[styles.doctorFilterText, selectedDoctorFilter === 'Dr. Vivekananthan (Wellness)' && styles.doctorFilterTextActive]}>Wellness</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <View key={apt.id}>
              <TouchableOpacity
                style={[
                  styles.appointmentCard,
                  { borderLeftColor: apt.status === 'PENDING' ? '#FF9F43' : apt.status === 'APPROVED' ? '#10B981' : '#DC2626' }
                ]}
                onPress={() => setExpandedAppointment(expandedAppointment === apt.id ? null : apt.id)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{apt.username || 'Unknown'}</Text>
                    <Text style={styles.appointmentDate}>
                      {new Date(apt.requestedDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[
                      styles.appointmentBadge,
                      { backgroundColor: apt.status === 'PENDING' ? '#FF9F43' : apt.status === 'APPROVED' ? '#10B981' : '#DC2626' }
                    ]}>
                      <Text style={styles.appointmentBadgeText}>{apt.status}</Text>
                    </View>
                    <MaterialIcons
                      name={expandedAppointment === apt.id ? 'expand-less' : 'expand-more'}
                      size={24}
                      color="#6B7280"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {expandedAppointment === apt.id && (
                <View style={styles.expandedContent}>
                  {apt.doctorName && (
                    <Text style={styles.appointmentDoctor}>Doctor: {apt.doctorName}</Text>
                  )}
                  <Text style={styles.appointmentReason}>{apt.reason}</Text>
                  <Text style={styles.appointmentDate}>
                    Requested: {new Date(apt.requestedDate).toLocaleString()}
                  </Text>
                  {apt.scheduledDate && (
                    <Text style={styles.appointmentScheduled}>
                      Scheduled: {new Date(apt.scheduledDate).toLocaleString()}
                    </Text>
                  )}
                  {apt.adminNotes && (
                    <Text style={styles.appointmentNotes}>Note: {apt.adminNotes}</Text>
                  )}
                  {apt.status === 'PENDING' && (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => { setAppointmentModal(apt); setScheduleDate(new Date()); setAdminNotes(''); }}>
                      <Text style={styles.reviewBtnText}>Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noData}>
            {selectedDoctorFilter === 'all' ? 'No appointment requests yet' : `No appointments for ${selectedDoctorFilter}`}
          </Text>
        )}
      </View>
    );
  };

  const renderQA = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>User Questions</Text>
      {Array.isArray(qaList) && qaList.length > 0 ? (
        qaList.map((qa) => (
          <View key={qa.id}>
            <TouchableOpacity
              style={[
                styles.appointmentCard,
                { borderLeftColor: qa.status === 'PENDING' ? '#FF9F43' : '#10B981' }
              ]}
              onPress={() => setExpandedQA(expandedQA === qa.id ? null : qa.id)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{qa.username}</Text>
                  <Text style={styles.appointmentDate}>
                    {new Date(qa.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[
                    styles.appointmentBadge,
                    { backgroundColor: qa.status === 'PENDING' ? '#FF9F43' : '#10B981' }
                  ]}>
                    <Text style={styles.appointmentBadgeText}>{qa.status}</Text>
                  </View>
                  <MaterialIcons
                    name={expandedQA === qa.id ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#6B7280"
                  />
                </View>
              </View>
            </TouchableOpacity>

            {expandedQA === qa.id && (
              <View style={styles.expandedContent}>
                <Text style={styles.appointmentReason}>{qa.question}</Text>
                <Text style={styles.appointmentDate}>
                  Asked: {new Date(qa.createdAt).toLocaleString()}
                </Text>
                {qa.answer && (
                  <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginTop: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#10B981', marginBottom: 4 }}>Your Answer:</Text>
                    <Text style={{ fontSize: 14, color: '#1B3B6F' }}>{qa.answer}</Text>
                  </View>
                )}
                {qa.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => { setQaModal(qa); setQaAnswer(''); }}>
                    <Text style={styles.reviewBtnText}>Reply</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No questions yet</Text>
      )}
    </View>
  );

  const renderHealingGallery = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Healing Gallery ({healingUploads.length})</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {healingUploads.map((item) => {
          // Calculate days remaining
          const now = new Date();
          const uploadDate = new Date(item.uploadTimestamp);
          const expiryDate = new Date(item.expiryDate);
          const diffTime = Math.abs(expiryDate - now);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isExpired = now > expiryDate;

          if (isExpired) return null; // Should be filtered by backend, but double check

          return (
            <TouchableOpacity
              key={item.id}
              style={{ width: '48%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
              onPress={() => {
                const fullUrl = item.photoUrl.startsWith('http') ? item.photoUrl : `${API_URL.replace('/api/v1', '')}${item.photoUrl}`;
                setSelectedImage(fullUrl);
              }}
            >
              <Image
                source={{ uri: item.photoUrl.startsWith('http') ? item.photoUrl : `${API_URL.replace('/api/v1', '')}${item.photoUrl}` }}
                style={{ width: '100%', height: 150, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                resizeMode="cover"
              />
              <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: 'JosefinSans-Bold', fontSize: 14, color: '#04223e', marginBottom: 4 }} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                  <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: '#516f8b', marginBottom: 8 }} numberOfLines={2}>{item.description}</Text>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3cd', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                  <MaterialIcons name="timer" size={12} color="#856404" />
                  <Text style={{ fontSize: 10, color: '#856404', marginLeft: 4 }}>{diffDays} days left</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' }}>by {item.username}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {healingUploads.length === 0 && (
          <Text style={styles.noData}>No active healing photos shared.</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <View style={styles.adminPill}>
              <Text style={styles.adminText}>Administrator</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.usersBtn} onPress={() => navigation.navigate('AdminNotifications')}>
            <MaterialIcons name="notifications" size={18} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.usersBtn} onPress={() => setActiveTab('users')}>
            <MaterialIcons name="people" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('role');
            navigation.navigate('Login');
          }}>
            <MaterialIcons name="logout" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'overview' && styles.tabActive]} onPress={() => setActiveTab('overview')}>
          <MaterialIcons name="dashboard" size={18} color={activeTab === 'overview' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'content' && styles.tabActive]} onPress={() => setActiveTab('content')}>
          <MaterialIcons name="video-library" size={18} color={activeTab === 'content' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'content' && styles.tabTextActive]}>Course</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'appointments' && styles.tabActive]} onPress={() => setActiveTab('appointments')}>
          <MaterialIcons name="event" size={18} color={activeTab === 'appointments' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'appointments' && styles.tabTextActive]}>Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'qa' && styles.tabActive]} onPress={() => setActiveTab('qa')}>
          <MaterialIcons name="question-answer" size={18} color={activeTab === 'qa' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'qa' && styles.tabTextActive]}>Q&A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'pending' && styles.tabActive]} onPress={() => setActiveTab('pending')}>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="person-add" size={18} color={activeTab === 'pending' ? '#ffb495' : '#6B7280'} />
            {pendingUsers.length > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingUsers.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'healing' && styles.tabActive]} onPress={() => setActiveTab('healing')}>
          <MaterialIcons name="collections" size={18} color={activeTab === 'healing' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'healing' && styles.tabTextActive]}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'qa' && renderQA()}
        {activeTab === 'pending' && renderPendingUsers()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'healing' && renderHealingGallery()}
      </ScrollView>

      {/* Filter Modal */}
      {showFilters && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filter Progress</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <MaterialIcons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, filterStatus === 'all' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('all')}>
                  <Text style={[styles.filterOptionText, filterStatus === 'all' && styles.filterOptionTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterStatus === 'attended' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('attended')}>
                  <Text style={[styles.filterOptionText, filterStatus === 'attended' && styles.filterOptionTextActive]}>Attended</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterStatus === 'absent' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('absent')}>
                  <Text style={[styles.filterOptionText, filterStatus === 'absent' && styles.filterOptionTextActive]}>Not Attended</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.clearFilterBtn} onPress={clearFilters}>
                  <Text style={styles.clearFilterText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyFilterBtn} onPress={applyFilters}>
                  <Text style={styles.applyFilterText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Calendar Modal */}
      {calendarModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Progress Calendar - {calendarModal.username}</Text>
                <TouchableOpacity onPress={() => setCalendarModal(null)}>
                  <MaterialIcons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.attendanceList}>
                {calendarModal.records.map((record) => (
                  <View key={record.id} style={[styles.calendarItem, record.attended ? styles.calendarItemPresent : styles.calendarItemAbsent]}>
                    <View style={styles.calendarDateSection}>
                      <Text style={[styles.calendarDate, !record.attended && styles.calendarDateAbsent]}>
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      <Text style={[styles.calendarStatus, record.attended ? styles.calendarStatusPresent : styles.calendarStatusAbsent]}>
                        {record.attended ? '✓ Present' : '✗ Absent'}
                      </Text>
                    </View>
                    <View style={[styles.calendarIndicator, record.attended ? styles.calendarIndicatorPresent : styles.calendarIndicatorAbsent]} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Attendance Modal */}
      {editModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Edit Attendance - {editModal.username}</Text>
                <TouchableOpacity onPress={() => setEditModal(null)}>
                  <MaterialIcons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.attendanceList}>
                {editModal.records.map((record) => (
                  <View key={record.id} style={[styles.attendanceItem, !record.attended && styles.attendanceItemAbsent]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.attendanceDate, !record.attended && styles.attendanceDateAbsent]}>{new Date(record.date).toLocaleDateString()}</Text>
                      <Text style={[styles.attendanceStatus, !record.attended && styles.attendanceStatusAbsent]}>{record.attended ? '✓ Present' : '✗ Absent'}</Text>
                    </View>
                    <View style={styles.attendanceActions}>
                      <TouchableOpacity
                        style={[styles.statusBtn, record.attended && styles.statusBtnActiveGreen]}
                        onPress={() => updateAttendance(record.id, true)}>
                        <Text style={[styles.statusBtnText, record.attended && styles.statusBtnTextActiveGreen]}>Present</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusBtn, !record.attended && styles.statusBtnActiveRed]}
                        onPress={() => updateAttendance(record.id, false)}>
                        <Text style={[styles.statusBtnText, !record.attended && styles.statusBtnTextActiveRed]}>Absent</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Appointment Review Modal */}
      {appointmentModal && (
        <Modal visible={true} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}>
            <View style={styles.appointmentModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Review Appointment</Text>
                <TouchableOpacity onPress={() => setAppointmentModal(null)}>
                  <MaterialIcons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.appointmentModalUser}>User: {appointmentModal.username}</Text>
                <Text style={styles.appointmentModalReason}>Reason: {appointmentModal.reason}</Text>

                <Text style={styles.appointmentModalLabel}>Schedule Date & Time:</Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowScheduleDatePicker(true)}>
                    <MaterialIcons name="event" size={16} color="#ffb495" style={{ marginRight: 6 }} />
                    <Text style={styles.dateTimeBtnText}>{scheduleDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowScheduleTimePicker(true)}>
                    <MaterialIcons name="access-time" size={16} color="#ffb495" style={{ marginRight: 6 }} />
                    <Text style={styles.dateTimeBtnText}>{scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>

                {showScheduleDatePicker && (
                  <DateTimePicker
                    value={scheduleDate}
                    mode="date"
                    display="default"
                    onChange={onScheduleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {showScheduleTimePicker && (
                  <DateTimePicker
                    value={scheduleDate}
                    mode="time"
                    display="default"
                    onChange={onScheduleTimeChange}
                  />
                )}

                <TextInput
                  style={styles.appointmentNotesInput}
                  placeholder="Admin notes (optional)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                />

                <TouchableOpacity style={styles.approveBtn} onPress={() => approveAppointment(appointmentModal.id)}>
                  <Text style={styles.approveBtnText}>✓ Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectBtn} onPress={() => rejectAppointment(appointmentModal.id)}>
                  <Text style={styles.rejectBtnText}>✗ Reject</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* Q&A Answer Modal */}
      {qaModal && (
        <Modal visible={true} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}>
            <View style={styles.appointmentModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Reply to Question</Text>
                <TouchableOpacity onPress={() => setQaModal(null)}>
                  <MaterialIcons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.appointmentModalUser}>User: {qaModal.username}</Text>
                <Text style={styles.appointmentModalReason}>Question: {qaModal.question}</Text>

                <TextInput
                  style={styles.appointmentNotesInput}
                  placeholder="Type your answer here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={qaAnswer}
                  onChangeText={setQaAnswer}
                />

                <TouchableOpacity style={styles.approveBtn} onPress={() => answerQuestion(qaModal.id)}>
                  <Text style={styles.approveBtnText}>✓ Submit Answer</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* User Detail Modal */}
      {userDetailModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.userDetailModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>User Details - {userDetailModal.name}</Text>
                <TouchableOpacity onPress={() => setUserDetailModal(null)}>
                  <MaterialIcons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              <View style={styles.userDetailInfo}>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Username:</Text>
                  <Text style={styles.userDetailValue}>{userDetailModal.username}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Email:</Text>
                  <Text style={styles.userDetailValue}>{userDetailModal.email}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Phone:</Text>
                  <Text style={styles.userDetailValue}>{userDetailModal.phone || 'N/A'}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Level:</Text>
                  <Text style={styles.userDetailValue}>Level {userDetailModal.level}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Registered:</Text>
                  <Text style={styles.userDetailValue}>
                    {new Date(userDetailModal.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceStats}>
                <View style={styles.attendanceStatBox}>
                  <Text style={styles.attendanceStatValue}>{userAttendanceDetails.length}</Text>
                  <Text style={styles.attendanceStatLabel}>Total Days</Text>
                </View>
                <View style={[styles.attendanceStatBox, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.attendanceStatValue, { color: '#27AE60' }]}>
                    {userAttendanceDetails.filter(a => a.attended).length}
                  </Text>
                  <Text style={styles.attendanceStatLabel}>Present</Text>
                </View>
                <View style={[styles.attendanceStatBox, { backgroundColor: '#FFEBEE' }]}>
                  <Text style={[styles.attendanceStatValue, { color: '#E74C3C' }]}>
                    {userAttendanceDetails.filter(a => !a.attended).length}
                  </Text>
                  <Text style={styles.attendanceStatLabel}>Absent</Text>
                </View>
              </View>

              <Text style={styles.attendanceCalendarTitle}>Attendance Calendar</Text>
              <ScrollView style={styles.attendanceCalendar}>
                {userAttendanceDetails.map((record) => (
                  <View key={record.id} style={[
                    styles.calendarItem,
                    record.attended ? styles.calendarItemPresent : styles.calendarItemAbsent
                  ]}>
                    <View style={styles.calendarDateSection}>
                      <Text style={[styles.calendarDate, !record.attended && styles.calendarDateAbsent]}>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </Text>
                      <Text style={[styles.calendarStatus, record.attended ? styles.calendarStatusPresent : styles.calendarStatusAbsent]}>
                        {record.attended ? '✓ Present' : '✗ Absent'}
                      </Text>
                    </View>
                    <View style={[styles.calendarIndicator, record.attended ? styles.calendarIndicatorPresent : styles.calendarIndicatorAbsent]} />
                  </View>
                ))}
                {userAttendanceDetails.length === 0 && (
                  <Text style={styles.noData}>No attendance records yet</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContent}>
              <MaterialIcons name="warning" size={64} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={styles.deleteModalTitle}>Delete User?</Text>
              <Text style={styles.deleteModalDesc}>Are you sure you want to delete {deleteModal}? This will permanently remove all their data.</Text>

              <View style={styles.deleteModalActions}>
                <TouchableOpacity style={styles.cancelDeleteBtn} onPress={() => setDeleteModal(null)}>
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmDeleteBtn} onPress={() => deleteUser(deleteModal)}>
                  <Text style={styles.confirmDeleteText}>Delete</Text>
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
            <View style={styles.successAlertContent}>
              <MaterialIcons name="error" size={48} color="#EF4444" style={{ marginBottom: 16 }} />
              <Text style={styles.successAlertTitle}>Error</Text>
              <Text style={styles.successAlertDesc}>{errorModal}</Text>
              <TouchableOpacity style={[styles.successAlertBtn, { backgroundColor: '#EF4444' }]} onPress={() => setErrorModal(null)}>
                <Text style={styles.successAlertBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Alert Modal */}
      {successAlert && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successAlertContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.successAlertTitle}>Success!</Text>
              <Text style={styles.successAlertDesc}>{successAlert}</Text>
              <TouchableOpacity style={styles.successAlertBtn} onPress={() => setSuccessAlert(null)}>
                <Text style={styles.successAlertBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Image Zoom Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={() => setSelectedImage(null)}>
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 12 }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#063159', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffb495', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'JosefinSans-Bold' },
  greeting: { color: '#FFFFFF', fontSize: 16, fontFamily: 'JosefinSans-Bold', marginBottom: 4 },
  adminPill: { paddingHorizontal: 30, paddingVertical: 3, borderRadius: 50, backgroundColor: '#b37e68' },
  adminText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'WorkSans-Bold', letterSpacing: 0.3 },
  headerRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  usersBtn: { backgroundColor: '#ffb495', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E74C3C', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontFamily: 'WorkSans-Bold' },
  logoutBtn: { backgroundColor: '#ffb495', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, height: 36, justifyContent: 'center' },
  logoutText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'WorkSans-Bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', gap: 2 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#ffb495' },
  tabText: { fontSize: 9, color: '#6B7280', fontFamily: 'WorkSans-Medium' },
  tabTextActive: { color: '#ffb495', fontFamily: 'WorkSans-Bold' },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statValue: { fontSize: 28, fontFamily: 'JosefinSans-Bold', color: '#ffb495', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center', fontFamily: 'WorkSans-Medium' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 17, fontFamily: 'JosefinSans-Bold', color: '#1B3B6F', marginBottom: 14, letterSpacing: 0.3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  filterBtn: { padding: 6, backgroundColor: '#DBEAFE', borderRadius: 5 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, color: '#111827', fontFamily: 'WorkSans-Regular' },
  progressItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  progressUser: { fontSize: 15, fontFamily: 'WorkSans-Bold', color: '#1B3B6F', marginBottom: 4 },
  progressBadges: { flexDirection: 'row', gap: 5 },
  viewBtn: { padding: 6, backgroundColor: '#DBEAFE', borderRadius: 5 },
  removeBtn: { padding: 6, backgroundColor: '#FEE2E2', borderRadius: 5 },
  badgeGreen: { backgroundColor: '#28a745', color: '#fff', fontSize: 11, fontFamily: 'WorkSans-Bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeGray: { backgroundColor: '#E5E7EB', color: '#6B7280', fontSize: 11, fontFamily: 'WorkSans-Bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  addBtn: { backgroundColor: '#ffb495', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginBottom: 8, shadowColor: '#b37e68', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'WorkSans-Bold', textAlign: 'center', letterSpacing: 0.2 },
  userItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffb495', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'JosefinSans-Bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontFamily: 'WorkSans-Bold', color: '#1B3B6F', marginBottom: 3 },
  userDetail: { fontSize: 13, color: '#6B7280', marginTop: 2, fontFamily: 'WorkSans-Regular' },
  userLevel: { fontSize: 13, color: '#b37e68', fontFamily: 'WorkSans-Bold', marginTop: 3 },
  contentDesc: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 16, fontFamily: 'WorkSans-Regular' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  filterModal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '85%', maxWidth: 360 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 18, fontFamily: 'JosefinSans-Bold', color: '#1B3B6F' },
  filterOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterOption: { flex: 1, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
  filterOptionActive: { backgroundColor: '#FFF5F0', borderColor: '#b37e68' },
  filterOptionText: { fontSize: 13, fontFamily: 'WorkSans-Medium', color: '#6B7280' },
  filterOptionTextActive: { color: '#b37e68', fontFamily: 'WorkSans-Bold' },
  filterActions: { flexDirection: 'row', gap: 10 },
  clearFilterBtn: { flex: 1, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center' },
  clearFilterText: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#6B7280' },
  applyFilterBtn: { flex: 1, padding: 12, backgroundColor: '#b37e68', borderRadius: 10, alignItems: 'center' },
  applyFilterText: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#FFFFFF' },
  deleteModalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '90%', maxWidth: 400, alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto' },
  deleteModalTitle: { fontSize: 22, fontFamily: 'JosefinSans-Bold', color: '#111827', marginBottom: 12, textAlign: 'center' },
  deleteModalDesc: { fontSize: 15, color: '#6B7280', marginBottom: 24, textAlign: 'center', lineHeight: 22, fontFamily: 'WorkSans-Regular' },
  deleteModalActions: { flexDirection: 'row', gap: 12 },
  cancelDeleteBtn: { flex: 1, padding: 14, backgroundColor: '#F3F4F6', borderRadius: 12 },
  cancelDeleteText: { fontSize: 15, fontFamily: 'WorkSans-Bold', color: '#6B7280', textAlign: 'center' },
  confirmDeleteBtn: { flex: 1, padding: 14, backgroundColor: '#EF4444', borderRadius: 12 },
  confirmDeleteText: { fontSize: 15, fontFamily: 'WorkSans-Bold', color: '#FFFFFF', textAlign: 'center' },
  editBtn: { padding: 6, backgroundColor: '#DBEAFE', borderRadius: 5 },
  editModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%', width: '100%', position: 'absolute', bottom: 0 },
  editModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  editModalTitle: { fontSize: 16, fontFamily: 'JosefinSans-Bold', color: '#111827', flex: 1 },
  attendanceList: { maxHeight: 400 },
  attendanceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  attendanceDate: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#1B3B6F' },
  attendanceStatus: { fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'WorkSans-Regular' },
  attendanceActions: { flexDirection: 'row', gap: 8 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F3F4F6', borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  statusBtnActive: { backgroundColor: '#DBEAFE', borderColor: '#28a745' },
  statusBtnActiveGreen: { backgroundColor: '#E8F5E9', borderColor: '#27AE60' },
  statusBtnActiveRed: { backgroundColor: '#FFEBEE', borderColor: '#E74C3C' },
  statusBtnText: { fontSize: 12, fontFamily: 'WorkSans-Medium', color: '#6B7280' },
  statusBtnTextActive: { color: '#28a745', fontFamily: 'WorkSans-Bold' },
  statusBtnTextActiveGreen: { color: '#27AE60', fontFamily: 'WorkSans-Bold' },
  statusBtnTextActiveRed: { color: '#E74C3C', fontFamily: 'WorkSans-Bold' },
  attendanceItemAbsent: { backgroundColor: '#FFF5F5' },
  attendanceDateAbsent: { color: '#E74C3C' },
  attendanceStatusAbsent: { color: '#E74C3C' },
  calendarBtn: { padding: 6, backgroundColor: '#D1FAE5', borderRadius: 5 },
  calendarModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%', width: '100%', position: 'absolute', bottom: 0 },
  calendarItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 10, borderLeftWidth: 5 },
  calendarItemPresent: { backgroundColor: '#E8F5E9', borderLeftColor: '#27AE60' },
  calendarItemAbsent: { backgroundColor: '#FFEBEE', borderLeftColor: '#E74C3C' },
  calendarDateSection: { flex: 1 },
  calendarDate: { fontSize: 15, fontFamily: 'WorkSans-Bold', color: '#27AE60', marginBottom: 4 },
  calendarDateAbsent: { color: '#E74C3C' },
  calendarStatus: { fontSize: 13, fontFamily: 'WorkSans-Medium' },
  calendarStatusPresent: { color: '#27AE60' },
  calendarStatusAbsent: { color: '#E74C3C' },
  calendarIndicator: { width: 12, height: 12, borderRadius: 6 },
  calendarIndicatorPresent: { backgroundColor: '#27AE60' },
  calendarIndicatorAbsent: { backgroundColor: '#E74C3C' },
  appointmentCard: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 6, marginBottom: 6, borderLeftWidth: 3 },
  appointmentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  appointmentBadgeText: { color: '#FFF', fontSize: 9, fontFamily: 'WorkSans-Bold', letterSpacing: 0.2 },
  appointmentReason: { fontSize: 12, color: '#1B3B6F', marginBottom: 5, lineHeight: 16, fontFamily: 'WorkSans-Regular' },
  appointmentDate: { fontSize: 10, color: '#6B7280', marginBottom: 2, fontFamily: 'WorkSans-Regular' },
  appointmentScheduled: { fontSize: 10, color: '#28a745', fontFamily: 'WorkSans-Bold', marginBottom: 2 },
  appointmentNotes: { fontSize: 10, color: '#6B7280', fontStyle: 'italic', marginBottom: 5, lineHeight: 14, fontFamily: 'WorkSans-Regular' },
  reviewBtn: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginTop: 5 },
  reviewBtnText: { color: '#FFF', fontSize: 11, fontFamily: 'WorkSans-Bold', textAlign: 'center', letterSpacing: 0.2 },
  noData: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', padding: 12, fontStyle: 'italic', fontFamily: 'WorkSans-Regular' },
  appointmentModalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, maxHeight: '75%', width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  appointmentModalUser: { fontSize: 13, color: '#1B3B6F', marginBottom: 6, fontFamily: 'WorkSans-Bold' },
  appointmentModalReason: { fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 16, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, fontFamily: 'WorkSans-Regular' },
  appointmentModalLabel: { fontSize: 12, fontFamily: 'WorkSans-Bold', color: '#1B3B6F', marginBottom: 6, marginTop: 4 },
  dateTimeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  dateTimeBtn: { flex: 1, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#b37e68', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  dateTimeBtnText: { fontSize: 11, fontFamily: 'WorkSans-Bold', color: '#1B3B6F' },
  appointmentNotesInput: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 12, color: '#1B3B6F', minHeight: 70, textAlignVertical: 'top', marginBottom: 10, fontFamily: 'WorkSans-Regular' },
  approveBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, marginBottom: 8, shadowColor: '#28a745', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  approveBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'WorkSans-Bold', textAlign: 'center' },
  rejectBtn: { backgroundColor: '#DC2626', padding: 12, borderRadius: 10, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  rejectBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'WorkSans-Bold', textAlign: 'center' },
  userDetailModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%', width: '100%', position: 'absolute', bottom: 0 },
  userDetailInfo: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 16 },
  userDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  userDetailLabel: { fontSize: 14, fontFamily: 'WorkSans-Medium', color: '#6B7280' },
  userDetailValue: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#1B3B6F' },
  attendanceStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  attendanceStatBox: { flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, alignItems: 'center' },
  attendanceStatValue: { fontSize: 24, fontFamily: 'JosefinSans-Bold', color: '#1B3B6F', marginBottom: 4 },
  attendanceStatLabel: { fontSize: 11, color: '#6B7280', fontFamily: 'WorkSans-Medium' },
  attendanceCalendarTitle: { fontSize: 16, fontFamily: 'JosefinSans-Bold', color: '#1B3B6F', marginBottom: 12 },
  attendanceCalendar: { maxHeight: 300 },
  pendingUserItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FFF9E6', borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#FFE082' },
  approveUserBtn: { padding: 6, backgroundColor: '#E8F5E9', borderRadius: 5 },
  expandedContent: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 6, marginTop: -5, marginBottom: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  contentSection: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  contentSectionTitle: { fontSize: 13, fontFamily: 'WorkSans-Bold', color: '#1B3B6F' },
  successAlertContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '85%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  successIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#28a745', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successAlertTitle: { fontSize: 18, fontFamily: 'JosefinSans-Bold', color: '#1B3B6F', marginBottom: 8 },
  successAlertDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20, fontFamily: 'WorkSans-Regular' },
  successAlertBtn: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10, width: '100%' },
  successAlertBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'WorkSans-Bold', textAlign: 'center' },
  pendingBadge: { position: 'absolute', top: -6, right: -8, backgroundColor: '#FF6B6B', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  pendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontFamily: 'WorkSans-Bold' },
  doctorFilterRow: { flexDirection: 'row', gap: 8 },
  doctorFilterBtn: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  doctorFilterBtnActive: { backgroundColor: '#FFF5F0', borderColor: '#b37e68' },
  doctorFilterText: { fontSize: 13, fontFamily: 'WorkSans-Medium', color: '#6B7280' },
  doctorFilterTextActive: { color: '#b37e68', fontFamily: 'WorkSans-Bold' },
  appointmentDoctor: { fontSize: 13, fontFamily: 'WorkSans-Bold', color: '#28a745', marginBottom: 6 },
  userAvatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffb495', justifyContent: 'center', alignItems: 'center' },
  userAvatarTextSmall: { color: '#FFFFFF', fontSize: 16, fontFamily: 'JosefinSans-Bold' },
  badgePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, marginRight: 4, gap: 3 },
  badgeActive: { backgroundColor: '#E8F5E9', borderColor: '#27AE60' },
  badgeInactive: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  badgeText: { fontSize: 9, fontFamily: 'WorkSans-Medium' },
  badgeTextActive: { color: '#27AE60', fontFamily: 'WorkSans-Bold' },
  badgeTextInactive: { color: '#9CA3AF' },
});
