package com.yoga.attendance.repository;

import com.yoga.attendance.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUsernameAndDate(String username, LocalDate date);
    List<UserProgress> findByDateOrderByUsernameAsc(LocalDate date);
    
    @Modifying
    @Query("DELETE FROM UserProgress up WHERE up.username = :username")
    void deleteByUsername(@Param("username") String username);
    
    @Modifying
    @Query("DELETE FROM UserProgress up WHERE up.date = :date")
    void deleteByDate(@Param("date") LocalDate date);
}
