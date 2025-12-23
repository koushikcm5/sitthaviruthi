package com.yoga.attendance.repository;

import com.yoga.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByVerificationOtp(String verificationOtp);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByApproved(Boolean approved);
}
