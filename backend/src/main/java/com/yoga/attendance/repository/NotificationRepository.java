package com.yoga.attendance.repository;

import com.yoga.attendance.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUsernameOrderByCreatedAtDesc(String username);
    List<Notification> findByUsernameAndReadFalseOrderByCreatedAtDesc(String username);
    long countByUsernameAndReadFalse(String username);
}
