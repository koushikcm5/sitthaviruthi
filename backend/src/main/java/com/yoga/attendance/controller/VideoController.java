package com.yoga.attendance.controller;

import com.yoga.attendance.entity.ManifestationVideo;
import com.yoga.attendance.entity.Video;
import com.yoga.attendance.repository.ManifestationVideoRepository;
import com.yoga.attendance.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "*")
public class VideoController {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ManifestationVideoRepository manifestationVideoRepository;

    // Get all videos
    @GetMapping("/videos")
    public ResponseEntity<?> getAllVideos() {
        return ResponseEntity.ok(videoRepository.findAllByOrderByLevelAscIdAsc());
    }

    // Get video by level
    @GetMapping("/video/level/{level}")
    public ResponseEntity<?> getVideoByLevel(@PathVariable Integer level) {
        List<Video> videos = videoRepository.findByLevelAndActiveTrueOrderByIdAsc(level);
        if (!videos.isEmpty()) {
            return ResponseEntity.ok(videos.get(0));
        }
        return ResponseEntity.ok(null);
    }

    // Complete video endpoint (simple tracking)
    @PostMapping("/video/complete/{videoId}")
    public ResponseEntity<?> completeVideoById(@PathVariable Long videoId) {
        // This endpoint can be enhanced to track video completion per user
        return ResponseEntity.ok(Map.of("message", "Video completed", "videoId", videoId));
    }

    // Get manifestation video
    @GetMapping("/manifestation-video")
    public ResponseEntity<?> getManifestationVideo() {
        try {
            Optional<ManifestationVideo> video = manifestationVideoRepository.findFirstByOrderByIdDesc();
            if (video.isPresent()) {
                ManifestationVideo v = video.get();
                Map<String, Object> response = new HashMap<>();
                response.put("id", v.getId());
                response.put("name", v.getName());
                response.put("url", v.getUrl());
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    // Get video URL
    @GetMapping("/video/{id}/url")
    public ResponseEntity<?> getVideoUrl(@PathVariable Long id) {
        try {
            Optional<Video> video = videoRepository.findById(id);
            if (video.isPresent()) {
                return ResponseEntity.ok(Map.of("url", video.get().getUrl()));
            }
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    // Admin: Add or Update video
    @PostMapping("/admin/video")
    public ResponseEntity<?> addOrUpdateVideo(@RequestBody Video videoData) {
        try {
            List<Video> existing = videoRepository.findByLevelAndActiveTrueOrderByIdAsc(videoData.getLevel());

            if (!existing.isEmpty()) {
                // Update existing video for this level
                Video video = existing.get(0);
                video.setTitle(videoData.getTitle());
                video.setUrl(videoData.getUrl());
                video.setPart(videoData.getPart());
                video.setDescription(videoData.getDescription());
                return ResponseEntity.ok(Map.of(
                        "message", "Video updated for Level " + videoData.getLevel(),
                        "video", videoRepository.save(video)));
            } else {
                // Add new video
                return ResponseEntity.ok(Map.of(
                        "message", "Video added for Level " + videoData.getLevel(),
                        "video", videoRepository.save(videoData)));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Add or Update manifestation video
    @PostMapping("/admin/manifestation-video")
    public ResponseEntity<?> addOrUpdateManifestationVideo(@RequestBody ManifestationVideo video) {
        Optional<ManifestationVideo> existing = manifestationVideoRepository.findFirstByOrderByIdDesc();
        if (existing.isPresent()) {
            ManifestationVideo existingVideo = existing.get();
            existingVideo.setName(video.getName());
            existingVideo.setUrl(video.getUrl());
            return ResponseEntity.ok(Map.of(
                    "message", "Manifestation video updated",
                    "video", manifestationVideoRepository.save(existingVideo)));
        } else {
            return ResponseEntity.ok(Map.of(
                    "message", "Manifestation video added",
                    "video", manifestationVideoRepository.save(video)));
        }
    }

    // Check if manifestation video exists
    @GetMapping("/admin/manifestation-video-exists")
    public ResponseEntity<?> checkManifestationVideoExists() {
        boolean exists = manifestationVideoRepository.findFirstByOrderByIdDesc().isPresent();
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
