package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "device_tokens")
@Data
public class DeviceToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String token;
    private String deviceType; // ANDROID, IOS
}
