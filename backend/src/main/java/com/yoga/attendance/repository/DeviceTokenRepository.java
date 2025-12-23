package com.yoga.attendance.repository;

import com.yoga.attendance.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
    List<DeviceToken> findByUsername(String username);
    Optional<DeviceToken> findByUsernameAndToken(String username, String token);
}
