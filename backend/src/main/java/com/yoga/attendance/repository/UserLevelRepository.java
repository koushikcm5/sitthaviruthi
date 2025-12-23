package com.yoga.attendance.repository;

import com.yoga.attendance.entity.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    Optional<UserLevel> findByUsername(String username);
    
    @Modifying
    @Query("DELETE FROM UserLevel ul WHERE ul.username = :username")
    void deleteByUsername(@Param("username") String username);
}
