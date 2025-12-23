package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_role", columnList = "role"),
    @Index(name = "idx_approved", columnList = "approved")
})
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false)
    private Integer level = 1;

    @Column(nullable = false)
    private Integer monthsCompleted = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean approved = false;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    private String verificationOtp;
    private LocalDateTime verificationOtpExpiry;
    @Column(nullable = false)
    private Boolean emailVerified = false;

    private String resetOtp;
    private LocalDateTime resetOtpExpiry;

    private String profilePictureUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attendance> attendances;

    public enum Role {
        USER, ADMIN
    }
}
