package com.yoga.attendance.repository;

import com.yoga.attendance.entity.QA;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QARepository extends JpaRepository<QA, Long> {
    List<QA> findByUsernameOrderByCreatedAtDesc(String username);
    List<QA> findAllByOrderByCreatedAtDesc();
}
