package com.yoga.attendance.controller;

import com.yoga.attendance.dto.*;
import com.yoga.attendance.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            return ResponseEntity.ok(authService.login(request, userAgent, ipAddress));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authentication failed"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(authService.refreshToken(request.get("refreshToken")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            authService.logout(username, token);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/sessions/{username}")
    public ResponseEntity<?> getActiveSessions(@PathVariable String username,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            boolean isAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!currentUser.getUsername().equals(username) && !isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            return ResponseEntity.ok(authService.getActiveSessions(username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> logoutSession(@PathVariable Long sessionId) {
        try {
            authService.logoutSession(sessionId);
            return ResponseEntity.ok(Map.of("message", "Session logged out"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout-all/{username}")
    public ResponseEntity<?> logoutAllDevices(@PathVariable String username) {
        try {
            authService.logoutAllDevices(username);
            return ResponseEntity.ok(Map.of("message", "Logged out from all devices"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@jakarta.validation.Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(authService.resetPassword(
                    request.get("email"),
                    request.get("otp"),
                    request.get("newPassword")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete-user/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        try {
            return ResponseEntity.ok(authService.deleteUser(username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending-users")
    public ResponseEntity<?> getPendingUsers() {
        try {
            return ResponseEntity.ok(authService.getPendingUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/approve-user/{username}")
    public ResponseEntity<?> approveUser(@PathVariable String username) {
        try {
            return ResponseEntity.ok(authService.approveUser(username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reject-user/{username}")
    public ResponseEntity<?> rejectUser(@PathVariable String username,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String reason = request != null ? request.get("reason") : null;
            return ResponseEntity.ok(authService.rejectUser(username, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@RequestParam("username") String username,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(authService.updateProfilePicture(username, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
