package com.yoga.attendance.controller;

import com.yoga.attendance.service.AttendanceReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/app")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AppOpenController {

    private final AttendanceReminderService attendanceReminderService;

    @PostMapping("/open")
    public ResponseEntity<?> onAppOpen(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser != null) {
                attendanceReminderService.checkAndSendReminderOnAppOpen(currentUser.getUsername());
            }
            return ResponseEntity.ok(Map.of("message", "App opened"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "App opened"));
        }
    }
}
