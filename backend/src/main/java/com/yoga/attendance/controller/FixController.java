package com.yoga.attendance.controller;

import com.yoga.attendance.entity.User;
import com.yoga.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/fix")
@CrossOrigin(origins = "*")
public class FixController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/verify-all-users")
    public ResponseEntity<?> verifyAllUsers() {
        try {
            var users = userRepository.findAll();
            int count = 0;
            for (User user : users) {
                if (!user.getEmailVerified()) {
                    user.setEmailVerified(true);
                    userRepository.save(user);
                    count++;
                }
            }
            return ResponseEntity.ok(Map.of("message", count + " users verified"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdminUser() {
        try {
            if (userRepository.findByUsername("admin").isPresent()) {
                User user = userRepository.findByUsername("admin").get();
                user.setRole(User.Role.ADMIN);
                user.setApproved(true);
                user.setEmailVerified(true);
                user.setPassword(passwordEncoder.encode("Admin123"));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Existing 'admin' user promoted to ADMIN"));
            }

            User user = new User();
            user.setName("System Admin");
            user.setUsername("admin");
            user.setEmail("admin@localhost.com");
            user.setPhone("0000000000");
            user.setPassword(passwordEncoder.encode("Admin123"));
            user.setRole(User.Role.ADMIN);
            user.setApproved(true);
            user.setEmailVerified(true);

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Admin user created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
