package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_levels")
@Data
public class UserLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private Integer level = 1; // 1, 2, or 3
    
    @Column(name = "current_video_index")
    private Integer currentVideoIndex = 0;
}
