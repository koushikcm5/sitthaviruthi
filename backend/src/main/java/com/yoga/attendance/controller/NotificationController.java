package com.yoga.attendance.controller;

import com.yoga.attendance.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            return ResponseEntity.ok(notificationService.getUserNotifications(currentUser.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getMyUnreadCount(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(currentUser.getUsername())));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("count", 0));
        }
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of("message", "Marked as read", "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark as read: " + e.getMessage(), "success", false));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            notificationService.markAllAsRead(currentUser.getUsername());
            return ResponseEntity.ok(Map.of("message", "All marked as read", "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark all as read: " + e.getMessage(), "success", false));
        }
    }

    @PostMapping("/device-token")
    public ResponseEntity<?> saveDeviceToken(@RequestBody Map<String, String> request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            notificationService.saveDeviceToken(
                    currentUser.getUsername(),
                    request.get("token"),
                    request.get("deviceType"));
            return ResponseEntity.ok(Map.of("message", "Device token saved", "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save device token: " + e.getMessage(), "success", false));
        }
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody com.yoga.attendance.dto.NotificationRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
            }

            if (request.getTargetUser() == null || request.getTitle() == null || request.getMessage() == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Missing required fields"));
            }

            if ("ALL_USERS".equals(request.getTargetUser())) {
                notificationService.sendToAllUsers(request.getTitle(), request.getMessage(), request.getType());
            } else if ("ALL_ADMINS".equals(request.getTargetUser())) {
                notificationService.sendToAdmin(request.getTitle(), request.getMessage(), request.getType());
            } else {
                notificationService.sendToUser(request.getTargetUser(), request.getTitle(), request.getMessage(),
                        request.getType());
            }

            return ResponseEntity.ok(Map.of("message", "Notification sent successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send notification: " + e.getMessage(), "success", false));
        }
    }
}
