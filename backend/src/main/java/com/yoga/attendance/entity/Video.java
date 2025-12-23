package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "videos")
@Data
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String url;
    
    @Column(nullable = false)
    private Integer level; // 1, 2, or 3
    
    @Column(name = "part")
    private Integer part; // For Level 3: 1 = Part 1, 2 = Part 2
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "active")
    private Boolean active = true;
}
