package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "user_progress")
@Data
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private LocalDate date;
    
    private Boolean videoCompleted = false;
    
    private Boolean routineCompleted = false;
    
    private Boolean habitsCompleted = false;
    
    private Boolean qaCompleted = false;
    
    private Boolean allTasksCompleted = false;
    
    @Column(name = "completed_video_id")
    private Long completedVideoId;
}
