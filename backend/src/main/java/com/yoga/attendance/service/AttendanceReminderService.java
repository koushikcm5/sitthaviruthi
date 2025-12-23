package com.yoga.attendance.service;

import com.yoga.attendance.entity.Notification;
import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.AttendanceRepository;
import com.yoga.attendance.repository.NotificationRepository;
import com.yoga.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceReminderService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    // Clean up old attendance reminder notifications at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupOldAttendanceReminders() {
        System.out.println("Cleaning up old attendance reminder notifications...");
        notificationService.deleteOldAttendanceReminders();
        System.out.println("Old attendance reminders cleaned up.");
    }

    // Send reminder when user opens app if attendance not marked
    public void checkAndSendReminderOnAppOpen(String username) {
        try {
            // Check if user exists
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                System.out.println("User not found: " + username);
                return;
            }
            
            // Skip reminder for admins only
            if ("ADMIN".equalsIgnoreCase(user.getRole().name())) {
                System.out.println("User is admin, skipping reminder: " + username);
                return;
            }
            
            LocalDate today = LocalDate.now();
            
            // Check if reminder already sent today (only send once per day)
            List<Notification> todayNotifications = notificationRepository
                .findByUsernameOrderByCreatedAtDesc(username);
            
            boolean reminderSentToday = todayNotifications.stream()
                .anyMatch(n -> 
                    "REMINDER".equals(n.getType()) &&
                    n.getTitle().contains("Mark Your Attendance") &&
                    n.getCreatedAt().toLocalDate().equals(today)
                );
            
            if (reminderSentToday) {
                return; // Already sent today, don't send again
            }
            
            // Send reminder first time app opens today (regardless of attendance status)
            notificationService.sendToUser(
                username,
                "Mark Your Attendance",
                "Welcome back! Don't forget to mark your attendance for today's practice.",
                "REMINDER"
            );
            System.out.println("Attendance reminder sent to user: " + username);
        } catch (Exception e) {
            System.err.println("Error checking attendance reminder: " + e.getMessage());
        }
    }
}
