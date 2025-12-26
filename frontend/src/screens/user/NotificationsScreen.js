import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../../services/notificationService';

const bodyRegular = 'WorkSans-Regular';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const getFilteredNotifications = () => {
    if (filter === 'ALL') return notifications;
    if (filter === 'UNREAD') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  };

  const getNotificationCounts = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const reminders = notifications.filter(n => n.type === 'REMINDER').length;
    return { total, unread, reminders };
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setError(null);
      const data = await notificationService.getUserNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification.id);
        // Update local state immediately for better UX
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state immediately
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Reload to ensure consistency
      loadNotifications();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return 'check-circle';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      case 'REMINDER': return 'alarm';
      case 'WORKSHOP': return 'event';
      case 'SESSION': return 'video-library';
      case 'APPOINTMENT': return 'calendar-today';
      case 'QA': return 'question-answer';
      case 'ATTENDANCE': return 'how-to-reg';
      case 'LEVEL_UP': return 'trending-up';
      case 'VIDEO': return 'play-circle-filled';
      default: return 'notifications';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'SUCCESS': return '#10b92fff';
      case 'WARNING': return '#F59E0B';
      case 'INFO': return '#3B82F6';
      case 'REMINDER': return '#ffb495';
      case 'LEVEL_UP': return '#F59E0B';
      default: return '#ffb495';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}>
      <View style={[styles.iconCircle, { backgroundColor: `${getIconColor(item.type)}20` }]}>
        <MaterialIcons name={getIcon(item.type)} size={24} color={getIconColor(item.type)} />
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
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ChemsingDashboard')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#1B3B6F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        {['ALL', 'UNREAD', 'REMINDER'].map(tab => {
          const counts = getNotificationCounts();
          const count = tab === 'ALL' ? counts.total :
            tab === 'UNREAD' ? counts.unread : counts.reminders;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
              onPress={() => setFilter(tab)}>
              <Text style={[styles.filterTabText, filter === tab && styles.activeFilterTabText]}>
                {tab} {count > 0 && `(${count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <Text style={styles.emptyText}>Loading notifications...</Text>
            ) : error ? (
              <>
                <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity onPress={loadNotifications} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <MaterialIcons name="notifications-none" size={64} color="#E5E7EB" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </>
            )}
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
  headerTitle: { fontSize: 20, color: '#1B3B6F', flex: 1, textAlign: 'center', fontFamily: bodyRegular },
  markAllText: { fontSize: 14, color: '#66483c', fontFamily: bodyRegular },
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
    borderLeftColor: '#b37e68'
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7F7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationContent: { flex: 1 },
  notificationTitle: {
    fontSize: 16,
    color: '#1B3B6F',
    marginBottom: 4,
    fontFamily: bodyRegular
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
    fontFamily: bodyRegular
  },
  notificationTime: { fontSize: 12, color: '#9CA3AF', fontFamily: bodyRegular },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#063159'
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    fontFamily: bodyRegular
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6'
  },
  activeFilterTab: {
    backgroundColor: '#063159'
  },
  filterTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: bodyRegular
  },
  activeFilterTabText: {
    color: '#FFFFFF'
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffb495',
    borderRadius: 8
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: bodyRegular
  }
});
