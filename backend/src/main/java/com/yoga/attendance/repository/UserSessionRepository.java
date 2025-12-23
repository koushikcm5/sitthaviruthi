package com.yoga.attendance.repository;

import com.yoga.attendance.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUsernameAndActiveTrue(String username);
    Optional<UserSession> findBySessionToken(String sessionToken);
    void deleteByUsername(String username);
}
