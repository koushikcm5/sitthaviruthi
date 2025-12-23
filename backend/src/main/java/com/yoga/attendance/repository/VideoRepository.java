package com.yoga.attendance.repository;

import com.yoga.attendance.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByLevelAndActiveTrueOrderByIdAsc(Integer level);
    List<Video> findAllByOrderByLevelAscIdAsc();
    void deleteByLevel(Integer level);
}
