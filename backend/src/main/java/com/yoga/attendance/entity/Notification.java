package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String title;
    private String message;
    private String type; // WORKSHOP, SESSION, TASK_REMINDER, APPOINTMENT, QA
    
    @Column(name = "is_read")
    private boolean read;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        read = false;
    }
}
