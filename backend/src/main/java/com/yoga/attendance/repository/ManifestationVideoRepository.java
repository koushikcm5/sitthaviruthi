package com.yoga.attendance.repository;

import com.yoga.attendance.entity.ManifestationVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ManifestationVideoRepository extends JpaRepository<ManifestationVideo, Long> {
    Optional<ManifestationVideo> findFirstByOrderByIdDesc();
}
