package com.yoga.attendance.repository;

import com.yoga.attendance.entity.HealingUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealingUploadRepository extends JpaRepository<HealingUpload, Long> {
    List<HealingUpload> findByIsActiveTrueAndExpiryDateAfterOrderByUploadTimestampDesc(LocalDateTime now);

    List<HealingUpload> findByUsernameAndIsActiveTrueOrderByUploadTimestampDesc(String username);
}
