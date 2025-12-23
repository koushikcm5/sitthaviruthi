package com.yoga.attendance.repository;

import com.yoga.attendance.entity.Attendance;
import com.yoga.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserOrderByAttendanceDateDesc(User user);
    List<Attendance> findAllByOrderByAttendanceDateDesc();
    Optional<Attendance> findByUserAndAttendanceDateBetween(User user, LocalDateTime start, LocalDateTime end);
    
    @Transactional
    void deleteByUser(User user);
}
