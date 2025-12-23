import { notificationAPI } from './api';
import { API_URL } from '../../config';

export const notificationService = {
  getUserNotifications: () => notificationAPI.getUserNotifications(),
  getUnreadCount: () => notificationAPI.getUnreadCount(),
  markAsRead: (notificationId) => notificationAPI.markAsRead(notificationId),
  markAllAsRead: () => notificationAPI.markAllAsRead(),
  saveDeviceToken: (username, token, deviceType) => notificationAPI.saveDeviceToken(username, token, deviceType),

  // Send notifications for major events
  sendNotification: async (username, title, message, type = 'INFO') => {
    try {
      await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, title, message, type })
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  },

  // User Events
  notifyRegistrationSuccess: (username) => {
    return notificationService.sendNotification(
      username,
      '🎉 Welcome to Sittha Viruthi Yoga!',
      'Your registration is successful. Please wait for admin approval to start your yoga journey.',
      'SUCCESS'
    );
  },

  notifyAccountApproved: (username) => {
    return notificationService.sendNotification(
      username,
      '✅ Account Approved!',
      'Congratulations! Your account has been approved. You can now login and start your yoga practice.',
      'SUCCESS'
    );
  },

  notifyAttendanceMarked: (username, status) => {
    return notificationService.sendNotification(
      username,
      status === 'present' ? '✅ Attendance Marked - Present' : '❌ Attendance Marked - Absent',
      `Your attendance for today has been marked as ${status}. Keep up the great work!`,
      status === 'present' ? 'SUCCESS' : 'WARNING'
    );
  },

  notifyLevelUp: (username, newLevel) => {
    const levelNames = { 2: 'Suya Viruthi', 3: 'Yoga Viruthi' };
    return notificationService.sendNotification(
      username,
      '🎊 Level Up Achievement!',
      `Congratulations! You've advanced to Level ${newLevel} - ${levelNames[newLevel]}. New content unlocked!`,
      'SUCCESS'
    );
  },

  notifyAppointmentScheduled: (username, date) => {
    return notificationService.sendNotification(
      username,
      '📅 Appointment Scheduled',
      `Your appointment has been approved and scheduled for ${new Date(date).toLocaleDateString()}. Don't miss it!`,
      'INFO'
    );
  },

  notifyAppointmentRejected: (username, reason) => {
    return notificationService.sendNotification(
      username,
      '❌ Appointment Request Declined',
      `Your appointment request was declined. ${reason ? `Reason: ${reason}` : 'Please contact admin for more details.'}`,
      'WARNING'
    );
  },

  notifyQuestionAnswered: (username, question) => {
    return notificationService.sendNotification(
      username,
      '💬 Your Question Answered!',
      `Admin has replied to your question: "${question.substring(0, 50)}...". Check the Q&A section.`,
      'INFO'
    );
  },

  notifyWorkshopAdded: (username, workshop) => {
    return notificationService.sendNotification(
      username,
      '🎓 New Workshop Available!',
      `New workshop "${workshop.title}" has been scheduled for ${new Date(workshop.startTime).toLocaleDateString()}. Join now!`,
      'INFO'
    );
  },

  notifyVideoAdded: (username, video) => {
    return notificationService.sendNotification(
      username,
      '🎥 New Video Available!',
      `New video "${video.title}" has been added to Level ${video.level}. Start watching now!`,
      'INFO'
    );
  },

  // Admin Events
  notifyAdminNewRegistration: (adminUsername, userDetails) => {
    return notificationService.sendNotification(
      adminUsername,
      '👤 New User Registration',
      `New user "${userDetails.name}" (${userDetails.username}) has registered and needs approval.`,
      'INFO'
    );
  },

  notifyAdminNewAppointment: (adminUsername, appointment) => {
    return notificationService.sendNotification(
      adminUsername,
      '📅 New Appointment Request',
      `${appointment.username} has requested an appointment. Reason: ${appointment.reason}`,
      'INFO'
    );
  },

  notifyAdminNewQuestion: (adminUsername, question) => {
    return notificationService.sendNotification(
      adminUsername,
      '❓ New Question Submitted',
      `${question.username} asked: "${question.question.substring(0, 50)}...". Please provide an answer.`,
      'INFO'
    );
  },

  notifyAdminAttendanceUpdate: (adminUsername, username, status) => {
    return notificationService.sendNotification(
      adminUsername,
      '📊 Attendance Update',
      `${username} marked attendance as ${status} for today.`,
      'INFO'
    );
  },

  // Daily Reminders
  notifyDailyReminder: (username) => {
    return notificationService.sendNotification(
      username,
      '🧘‍♀️ Daily Practice Reminder',
      'Time for your daily yoga practice! Complete your routine and mark attendance.',
      'REMINDER'
    );
  },

  notifyMissedAttendance: (username, days) => {
    return notificationService.sendNotification(
      username,
      '⚠️ Missed Practice Alert',
      `You've missed ${days} day(s) of practice. Get back on track with your yoga journey!`,
      'WARNING'
    );
  }
};
