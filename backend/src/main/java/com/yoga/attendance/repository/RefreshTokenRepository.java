package com.yoga.attendance.repository;

import com.yoga.attendance.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUsername(String username);
    void deleteByUsername(String username);
    void deleteByToken(String token);
}
