package com.yoga.attendance.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TestController {

    private final PasswordEncoder passwordEncoder;

    @GetMapping("/encode/{password}")
    public Map<String, String> encodePassword(@PathVariable String password) {
        String encoded = passwordEncoder.encode(password);
        System.out.println("Encoding password: " + password);
        System.out.println("Encoded result: " + encoded);
        return Map.of("password", password, "encoded", encoded);
    }

    @GetMapping("/verify/{password}/{hash}")
    public Map<String, Object> verifyPassword(@PathVariable String password, @PathVariable String hash) {
        boolean matches = passwordEncoder.matches(password, hash);
        return Map.of("password", password, "hash", hash, "matches", matches);
    }

    @GetMapping("/test-email")
    public Map<String, String> testEmail() {
        try {
            return Map.of("status", "Email configuration loaded", "message",
                    "Use forgot-password endpoint to test actual email sending");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}
