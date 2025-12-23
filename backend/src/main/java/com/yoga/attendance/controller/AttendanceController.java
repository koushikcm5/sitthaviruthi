package com.yoga.attendance.controller;

import com.yoga.attendance.dto.AttendanceRequest;
import com.yoga.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/attendance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(
            @RequestHeader("username") String username,
            @RequestBody AttendanceRequest request) {
        try {
            return ResponseEntity.ok(attendanceService.markAttendance(username, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserAttendance(@PathVariable String username) {
        try {
            return ResponseEntity.ok(attendanceService.getUserAttendance(username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllAttendance() {
        try {
            return ResponseEntity.ok(attendanceService.getAllAttendance());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(attendanceService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            return ResponseEntity.ok(attendanceService.updateAttendance(id, request.get("attended")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
