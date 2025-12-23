package com.yoga.attendance.service;

import com.yoga.attendance.entity.Notification;
import com.yoga.attendance.entity.DeviceToken;
import com.yoga.attendance.repository.NotificationRepository;
import com.yoga.attendance.repository.DeviceTokenRepository;
import com.yoga.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;
    private final FCMService fcmService;

    // Send notification to specific user
    public void sendToUser(String username, String title, String message, String type) {
        try {
            if (username == null || username.trim().isEmpty()) {
                System.err.println("Cannot send notification: username is null or empty");
                return;
            }
            
            // Save to database
            Notification notification = new Notification();
            notification.setUsername(username);
            notification.setTitle(title != null ? title : "Notification");
            notification.setMessage(message != null ? message : "");
            notification.setType(type != null ? type : "INFO");
            notification.setRead(false);
            notificationRepository.save(notification);
            System.out.println("✓ Notification saved for user: " + username);

            // Send push notification
            sendPushNotification(username, title, message);
        } catch (Exception e) {
            System.err.println("Error sending notification to " + username + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Send notification to all users
    public void sendToAllUsers(String title, String message, String type) {
        System.out.println("=== sendToAllUsers called ===");
        System.out.println("Title: " + title);
        System.out.println("Message: " + message);
        System.out.println("Type: " + type);

        List<com.yoga.attendance.entity.User> allUsers = userRepository.findAll();
        System.out.println("Total users in database: " + allUsers.size());

        allUsers.forEach(user -> {
            System.out.println("Checking user: " + user.getUsername() + ", Role: " + user.getRole());
            // Case-insensitive check to handle ADMIN, Admin, admin, etc.
            String roleStr = user.getRole() != null ? user.getRole().name() : null;
            if (roleStr == null || !"ADMIN".equalsIgnoreCase(roleStr)) {
                System.out.println("✓ Sending notification to user: " + user.getUsername());
                sendToUser(user.getUsername(), title, message, type);
            } else {
                System.out.println("✗ Skipping admin user: " + user.getUsername());
            }
        });
        System.out.println("=== sendToAllUsers completed ===");
    }

    // Send notification to admin
    public void sendToAdmin(String title, String message, String type) {
        System.out.println("=== sendToAdmin called ===");
        System.out.println("Title: " + title);
        System.out.println("Message: " + message);
        System.out.println("Type: " + type);

        List<com.yoga.attendance.entity.User> allUsers = userRepository.findAll();
        System.out.println("Total users in database: " + allUsers.size());

        allUsers.forEach(user -> {
            System.out.println("Checking user: " + user.getUsername() + ", Role: " + user.getRole());
            // Case-insensitive check to handle ADMIN, Admin, admin, etc.
            String roleStr = user.getRole() != null ? user.getRole().name() : null;
            if (roleStr != null && "ADMIN".equalsIgnoreCase(roleStr)) {
                System.out.println("✓ Sending notification to admin: " + user.getUsername());
                sendToUser(user.getUsername(), title, message, type);
            }
        });
        System.out.println("=== sendToAdmin completed ===");
    }

    // Get user notifications
    public List<Notification> getUserNotifications(String username) {
        return notificationRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    // Get unread count
    public long getUnreadCount(String username) {
        return notificationRepository.countByUsernameAndReadFalse(username);
    }

    // Mark as read
    public void markAsRead(Long notificationId) {
        try {
            System.out.println("Attempting to mark notification " + notificationId + " as read");
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
                System.out.println("Successfully marked notification " + notificationId + " as read");
            } else {
                System.out.println("Notification " + notificationId + " was already marked as read");
            }
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            throw new RuntimeException("Failed to mark notification as read", e);
        }
    }

    // Mark all as read
    public void markAllAsRead(String username) {
        try {
            System.out.println("Marking all notifications as read for user: " + username);
            List<Notification> notifications = notificationRepository
                    .findByUsernameAndReadFalseOrderByCreatedAtDesc(username);
            
            if (notifications.isEmpty()) {
                System.out.println("No unread notifications found for user: " + username);
                return;
            }
            
            notifications.forEach(notification -> {
                notification.setRead(true);
                notificationRepository.save(notification);
            });
            System.out.println("Successfully marked " + notifications.size() + " notifications as read");
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            throw new RuntimeException("Failed to mark all notifications as read", e);
        }
    }

    // Save device token
    public void saveDeviceToken(String username, String token, String deviceType) {
        try {
            if (username == null || token == null) {
                System.err.println("Cannot save device token: username or token is null");
                return;
            }
            
            DeviceToken deviceToken = deviceTokenRepository
                    .findByUsernameAndToken(username, token)
                    .orElse(new DeviceToken());
            deviceToken.setUsername(username);
            deviceToken.setToken(token);
            deviceToken.setDeviceType(deviceType != null ? deviceType : "UNKNOWN");
            deviceTokenRepository.save(deviceToken);
            System.out.println("Device token saved for user: " + username);
        } catch (Exception e) {
            System.err.println("Error saving device token: " + e.getMessage());
        }
    }

    // Send push notification via FCM
    private void sendPushNotification(String username, String title, String message) {
        try {
            if (fcmService != null) {
                fcmService.sendToUser(username, title, message, "general");
            }
        } catch (Exception e) {
            System.err.println("Error sending push notification: " + e.getMessage());
        }
    }

    // Send workshop reminder
    public void sendWorkshopReminder(String username, String workshopTitle, String time) {
        String title = "Workshop Reminder";
        String message = workshopTitle + " starts at " + time;
        sendToUser(username, title, message, "workshop_reminder");
    }

    // Send attendance reminder
    public void sendAttendanceReminder(String username) {
        String title = "Attendance Reminder";
        String message = "Don't forget to mark your attendance today!";
        sendToUser(username, title, message, "attendance_reminder");
    }

    // Convenience method: Notify all admins
    public void notifyAllAdmins(String title, String message, String type) {
        sendToAdmin(title, message, type);
    }

    // Convenience method: Notify all users
    public void notifyAllUsers(String title, String message, String type) {
        sendToAllUsers(title, message, type);
    }

    // Delete old attendance reminder notifications
    public void deleteOldAttendanceReminders() {
        try {
            List<Notification> allNotifications = notificationRepository.findAll();
            for (Notification notification : allNotifications) {
                if ("REMINDER".equals(notification.getType()) && 
                    (notification.getTitle().contains("Attendance Reminder") || 
                     notification.getTitle().contains("Mark Your Attendance"))) {
                    notificationRepository.delete(notification);
                }
            }
            System.out.println("Old attendance reminders deleted");
        } catch (Exception e) {
            System.err.println("Error deleting old attendance reminders: " + e.getMessage());
        }
    }
}
