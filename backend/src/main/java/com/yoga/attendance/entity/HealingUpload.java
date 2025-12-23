package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "healing_uploads")
@Data
public class HealingUpload {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username; // define who uploaded it

    @Column(nullable = false)
    private String name; // Name for the photo/entry

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String photoUrl;

    @Column(nullable = false)
    private LocalDateTime uploadTimestamp;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Helper to check if expired
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
