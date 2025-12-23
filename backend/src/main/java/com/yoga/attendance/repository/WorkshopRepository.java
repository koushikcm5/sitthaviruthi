package com.yoga.attendance.repository;

import com.yoga.attendance.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    List<Workshop> findByLevelAndTypeAndActiveTrueAndEndTimeAfterOrderByStartTimeAsc(Integer level, String type, LocalDateTime now);
    List<Workshop> findTop5ByActiveTrueOrderByCreatedAtDesc();
    void deleteByEndTimeBefore(LocalDateTime time);
    List<Workshop> findByLevelAndTypeAndActiveTrue(Integer level, String type);
}
