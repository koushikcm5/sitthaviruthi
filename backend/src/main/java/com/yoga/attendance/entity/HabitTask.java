package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "habit_tasks")
@Data
public class HabitTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Boolean active = true;
}
