package com.yoga.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "daily_routines")
@Data
public class DailyRoutine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer sequence;

    private Boolean active = true;
}
