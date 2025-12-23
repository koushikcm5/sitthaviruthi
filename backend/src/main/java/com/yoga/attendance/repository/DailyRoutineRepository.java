package com.yoga.attendance.repository;

import com.yoga.attendance.entity.DailyRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DailyRoutineRepository extends JpaRepository<DailyRoutine, Long> {
    List<DailyRoutine> findByActiveTrueOrderBySequenceAsc();
}
