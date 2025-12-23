package com.yoga.attendance.controller;

import com.yoga.attendance.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationTestController {

    private final NotificationService notificationService;

    @PostMapping("/send-test")
    public ResponseEntity<?> sendTestNotification(
            @RequestBody Map<String, String> request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String username = request.getOrDefault("username", currentUser.getUsername());
        String title = request.getOrDefault("title", "Test Notification");
        String message = request.getOrDefault("message", "This is a test notification");
        String type = request.getOrDefault("type", "INFO");

        notificationService.sendToUser(username, title, message, type);
        
        return ResponseEntity.ok(Map.of(
            "message", "Test notification sent",
            "username", username,
            "title", title
        ));
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkNotificationSystem() {
        return ResponseEntity.ok(Map.of(
            "status", "Notification system is running",
            "timestamp", java.time.LocalDateTime.now()
        ));
    }
}
