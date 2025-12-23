package com.yoga.attendance.service;

import com.yoga.attendance.dto.*;
import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.UserRepository;
import com.yoga.attendance.repository.AttendanceRepository;
import com.yoga.attendance.repository.UserLevelRepository;
import com.yoga.attendance.security.JwtUtil;
import com.yoga.attendance.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserLevelRepository userLevelRepository;
    private final com.yoga.attendance.repository.UserProgressRepository userProgressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final InputSanitizer inputSanitizer;
    private final com.yoga.attendance.repository.RefreshTokenRepository refreshTokenRepository;
    private final SessionService sessionService;
    private final NotificationService notificationService;

    public Map<String, Object> login(LoginRequest request) {
        return login(request, null, null);
    }

    public Map<String, Object> login(LoginRequest request, String deviceInfo, String ipAddress) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.getApproved()) {
            throw new RuntimeException("PENDING_APPROVAL");
        }

        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        // Save refresh token
        com.yoga.attendance.entity.RefreshToken refreshTokenEntity = new com.yoga.attendance.entity.RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUsername(user.getUsername());
        refreshTokenEntity.setExpiryDate(java.time.LocalDateTime.now().plusDays(7));
        refreshTokenEntity.setDeviceInfo(deviceInfo);
        refreshTokenEntity.setIpAddress(ipAddress);
        refreshTokenRepository.save(refreshTokenEntity);

        // Create session
        sessionService.createSession(user.getUsername(), accessToken, deviceInfo, ipAddress);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("role", user.getRole().name());
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("level", user.getLevel());
        response.put("profilePicture", user.getProfilePictureUrl());

        return response;
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        com.yoga.attendance.entity.RefreshToken tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (tokenEntity.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            refreshTokenRepository.delete(tokenEntity);
            throw new RuntimeException("Refresh token expired");
        }

        User user = userRepository.findByUsername(tokenEntity.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("refreshToken", refreshToken);

        return response;
    }

    @Transactional
    public void logout(String username, String token) {
        refreshTokenRepository.deleteByUsername(username);
        sessionService.logoutAllSessions(username);
    }

    public List<Map<String, Object>> getActiveSessions(String username) {
        return sessionService.getActiveSessions(username);
    }

    @Transactional
    public void logoutSession(Long sessionId) {
        sessionService.logoutSession(sessionId);
    }

    @Transactional
    public void logoutAllDevices(String username) {
        refreshTokenRepository.deleteByUsername(username);
        sessionService.logoutAllSessions(username);
    }

    private static final java.security.SecureRandom secureRandom = new java.security.SecureRandom();

    public Map<String, String> register(RegisterRequest request) {
        String username = inputSanitizer.sanitize(request.getUsername());
        String email = inputSanitizer.sanitize(request.getEmail());
        String name = inputSanitizer.sanitize(request.getName());
        String phone = inputSanitizer.sanitize(request.getPhone());

        if (request.getPassword().length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters");
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(name);
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Fix: All users start as USER and require approval
        user.setRole(User.Role.USER);
        user.setApproved(false);
        user.setEmailVerified(false); // Should require verification

        userRepository.save(user);

        // Notify all admins about new registration
        try {
            notificationService.notifyAllAdmins(
                    "New User Registration",
                    name + " (" + username + ") has registered and is pending approval.",
                    "INFO");
        } catch (Exception e) {
            System.err.println("Failed to notify admin: " + e.getMessage());
        }

        // Send verification email automatically (logic to be added if not present)
        // For now, consistent with existing flow

        return Map.of("message", "Registration successful. Please wait for admin approval.");
    }

    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send email (mocked or real)
        // In production, DO NOT print OTP to console logs if avoidable, but we'll
        // remove it from response
        System.out.println("Processing password reset for: " + email);
        emailService.sendPasswordResetOtp(email, otp); // Ensure this method exists and sends email

        return Map.of("message", "If this email exists, a reset link has been sent.");
    }

    public Map<String, String> resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);

        return Map.of("message", "Password reset successful");
    }

    @Transactional
    public Map<String, String> deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin user");
        }

        try {
            userProgressRepository.deleteByUsername(username);
            userProgressRepository.flush();

            userLevelRepository.deleteByUsername(username);
            userLevelRepository.flush();

            attendanceRepository.deleteByUser(user);
            attendanceRepository.flush();

            userRepository.delete(user);
            userRepository.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }

        return Map.of("message", "User deleted successfully");
    }

    public List<Map<String, Object>> getPendingUsers() {
        List<User> pendingUsers = userRepository.findByApproved(false);
        return pendingUsers.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("name", user.getName());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("phone", user.getPhone());
                    userMap.put("createdAt", user.getCreatedAt());
                    return userMap;
                })
                .toList();
    }

    public Map<String, String> approveUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setApproved(true);
        userRepository.save(user);

        // Notify user about approval
        notificationService.sendToUser(
                username,
                "Account Approved",
                "Congratulations! Your account has been approved. You can now login and start your yoga journey.",
                "SUCCESS");

        return Map.of("message", "User approved successfully");
    }

    public Map<String, String> verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getVerificationOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setEmailVerified(true);
        user.setVerificationOtp(null);
        user.setVerificationOtpExpiry(null);
        userRepository.save(user);

        return Map.of("message", "Email verified successfully");
    }

    public Map<String, String> resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        String otp = String.format("%06d", secureRandom.nextInt(999999));
        user.setVerificationOtp(otp);
        user.setVerificationOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        if (!emailService.sendVerificationOtp(user.getEmail(), otp)) {
            System.out.println("\n=== EMAIL FAILED - CONSOLE OTP ===");
            System.out.println("Email: " + email);
            System.out.println("Verification OTP: " + otp);
            System.out.println("================================\n");
        }

        return Map.of("message", "Verification OTP sent");
    }

    public Map<String, String> rejectUser(String username, String reason) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Notify user about rejection
        String message = "Your registration has been declined.";
        if (reason != null && !reason.trim().isEmpty()) {
            message += " Reason: " + reason;
        }

        notificationService.sendToUser(
                username,
                "Registration Declined",
                message,
                "WARNING");

        // Delete the user account
        userRepository.delete(user);

        return Map.of("message", "User rejected and deleted successfully");
    }

    public Map<String, String> updateProfilePicture(String username, MultipartFile file) {
        System.out.println("DEBUG: updateProfilePicture called with username raw: [" + username + "]");

        // Trim just in case
        String cleanUsername = username.trim();

        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> {
                    System.out.println("ERROR: User not found in DB for username: [" + cleanUsername + "]");
                    return new RuntimeException("User not found: " + cleanUsername);
                });

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            System.out.println("Processing profile picture upload for: " + username);

            // Create uploads directory if not exists
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            System.out.println("Upload path: " + uploadPath);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg"; // Default
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = username + "_" + System.currentTimeMillis() + extension;
            Path filePath = uploadPath.resolve(filename);

            System.out.println("Saving to: " + filePath);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("File saved successfully");

            // Update user profile URL (relative path for serving)
            String fileUrl = "/uploads/" + filename;
            user.setProfilePictureUrl(fileUrl);
            userRepository.save(user);

            return Map.of("message", "Profile picture updated successfully", "url", fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }
}
