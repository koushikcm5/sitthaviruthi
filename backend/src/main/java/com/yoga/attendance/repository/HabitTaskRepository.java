package com.yoga.attendance.repository;

import com.yoga.attendance.entity.HabitTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HabitTaskRepository extends JpaRepository<HabitTask, Long> {
    List<HabitTask> findByActiveTrue();
}
