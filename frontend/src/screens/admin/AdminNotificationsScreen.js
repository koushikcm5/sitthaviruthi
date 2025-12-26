import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../../services/notificationService';

export default function AdminNotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const username = await AsyncStorage.getItem('username');
    const data = await notificationService.getUserNotifications(username);
    setNotifications(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    await notificationService.markAsRead(notification.id);
    loadNotifications();
    
    // Navigate based on notification type
    if (notification.type === 'APPOINTMENT') {
      navigation.navigate('AdminAppointments');
    } else if (notification.type === 'QA') {
      navigation.navigate('AdminQA');
    }
  };

  const handleMarkAllRead = async () => {
    const username = await AsyncStorage.getItem('username');
    await notificationService.markAllAsRead(username);
    loadNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT': return 'calendar-today';
      case 'QA': return 'question-answer';
      default: return 'notifications';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={getIcon(item.type)} size={24} color="#ffb495" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminDashboard')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#1B3B6F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1B3B6F', flex: 1, textAlign: 'center' },
  markAllText: { fontSize: 14, color: '#ffb495',fontFamily: 'WorkSans-Medium' },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  unreadCard: { 
    backgroundColor: '#F0F9FF', 
    borderLeftWidth: 4, 
    borderLeftColor: '#00A8A8' 
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffe1d5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationContent: { flex: 1 },
  notificationTitle: { 
    fontSize: 16, 
    fontFamily: 'WorkSans-Medium',
    color: '#1B3B6F', 
    marginBottom: 4 
  },
  notificationMessage: { 
    fontSize: 12, 
    color: '#6B7280', 
    fontFamily: 'WorkSans-Medium',
    marginBottom: 4,
    lineHeight: 20
  },
  notificationTime: { fontSize: 12, color: '#9CA3AF' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    fontFamily: 'WorkSans-Medium',
    backgroundColor: '#ffb495'
  },
  emptyState: { 
    alignItems: 'center', 
    marginTop: 100,
    padding: 20
  },
  emptyText: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    marginTop: 16 
  }
});
