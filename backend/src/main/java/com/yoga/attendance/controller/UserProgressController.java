package com.yoga.attendance.controller;

import com.yoga.attendance.entity.*;
import com.yoga.attendance.repository.DailyRoutineRepository;
import com.yoga.attendance.repository.UserLevelRepository;
import com.yoga.attendance.repository.UserProgressRepository;
import com.yoga.attendance.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "*")
public class UserProgressController {

    @Autowired
    private UserLevelRepository userLevelRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private DailyRoutineRepository dailyRoutineRepository;

    // Get user's current level and video
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserContent(@PathVariable String username) {
        UserLevel userLevel = userLevelRepository.findByUsername(username)
                .orElseGet(() -> {
                    UserLevel newLevel = new UserLevel();
                    newLevel.setUsername(username);
                    newLevel.setLevel(1);
                    newLevel.setCurrentVideoIndex(0);
                    return userLevelRepository.save(newLevel);
                });

        List<Video> videos = videoRepository.findByLevelAndActiveTrueOrderByIdAsc(userLevel.getLevel());
        Video currentVideo = videos.isEmpty() ? null
                : videos.get(Math.min(userLevel.getCurrentVideoIndex(), videos.size() - 1));

        Map<String, Object> response = new HashMap<>();
        response.put("level", userLevel.getLevel());
        response.put("currentVideoIndex", userLevel.getCurrentVideoIndex());
        response.put("currentVideo", currentVideo);
        response.put("totalVideos", videos.size());

        return ResponseEntity.ok(response);
    }

    // Get daily routines
    @GetMapping("/routines")
    public ResponseEntity<?> getDailyRoutines() {
        return ResponseEntity.ok(dailyRoutineRepository.findByActiveTrueOrderBySequenceAsc());
    }

    // Admin: Add routine
    @PostMapping("/admin/routine")
    public ResponseEntity<?> addRoutine(@RequestBody DailyRoutine routine) {
        return ResponseEntity.ok(dailyRoutineRepository.save(routine));
    }

    // Mark video complete
    @PostMapping("/complete-video")
    public ResponseEntity<?> completeVideo(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        Long videoId = Long.parseLong(request.getOrDefault("videoId", "0"));

        // Update UserProgress (Daily tracking)
        UserProgress progress = getOrCreateProgress(username);
        progress.setVideoCompleted(true);
        progress.setCompletedVideoId(videoId);
        userProgressRepository.save(progress);

        // Update UserLevel (Overall progress)
        try {
            UserLevel userLevel = userLevelRepository.findByUsername(username)
                    .orElseGet(() -> {
                        UserLevel newLevel = new UserLevel();
                        newLevel.setUsername(username);
                        newLevel.setLevel(1);
                        newLevel.setCurrentVideoIndex(0);
                        return userLevelRepository.save(newLevel);
                    });

            // Increment video index
            userLevel.setCurrentVideoIndex(userLevel.getCurrentVideoIndex() + 1);
            userLevelRepository.save(userLevel);
        } catch (Exception e) {
            System.err.println("Error updating user level: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Video completed and progress updated"));
    }

    // Mark routine complete
    @PostMapping("/complete-routine")
    public ResponseEntity<?> completeRoutine(@RequestBody Map<String, String> request) {
        UserProgress progress = getOrCreateProgress(request.get("username"));
        progress.setRoutineCompleted(true);
        progress.setAllTasksCompleted(true);
        userProgressRepository.save(progress);
        return ResponseEntity.ok(Map.of("message", "Routine completed"));
    }

    // Mark habits complete
    @PostMapping("/complete-habits")
    public ResponseEntity<?> completeHabits(@RequestBody Map<String, String> request) {
        UserProgress progress = getOrCreateProgress(request.get("username"));
        progress.setHabitsCompleted(true);
        progress.setAllTasksCompleted(true);
        userProgressRepository.save(progress);
        return ResponseEntity.ok(Map.of("message", "Habits completed"));
    }

    // Mark Q&A complete
    @PostMapping("/complete-qa")
    public ResponseEntity<?> completeQA(@RequestBody Map<String, String> request) {
        UserProgress progress = getOrCreateProgress(request.get("username"));
        progress.setQaCompleted(true);
        progress.setAllTasksCompleted(true);
        userProgressRepository.save(progress);
        return ResponseEntity.ok(Map.of("message", "Q&A completed"));
    }

    // Get today's progress
    @GetMapping("/progress/{username}")
    public ResponseEntity<?> getProgress(@PathVariable String username) {
        UserProgress progress = getOrCreateProgress(username);
        return ResponseEntity.ok(progress);
    }

    // Admin: Get all users progress for today
    @GetMapping("/admin/progress")
    public ResponseEntity<?> getAllProgress() {
        return ResponseEntity.ok(userProgressRepository.findByDateOrderByUsernameAsc(LocalDate.now()));
    }

    // Admin: Update user level
    @PostMapping("/admin/user-level")
    public ResponseEntity<?> updateUserLevel(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        Integer level = (Integer) request.get("level");

        UserLevel userLevel = userLevelRepository.findByUsername(username).orElseThrow();
        userLevel.setLevel(level);
        userLevel.setCurrentVideoIndex(0);
        userLevelRepository.save(userLevel);

        return ResponseEntity.ok(Map.of("message", "User level updated"));
    }

    private UserProgress getOrCreateProgress(String username) {
        return userProgressRepository.findByUsernameAndDate(username, LocalDate.now())
                .orElseGet(() -> {
                    UserProgress progress = new UserProgress();
                    progress.setUsername(username);
                    progress.setDate(LocalDate.now());
                    progress.setVideoCompleted(false);
                    progress.setRoutineCompleted(false);
                    progress.setHabitsCompleted(false);
                    progress.setQaCompleted(false);
                    progress.setAllTasksCompleted(false);
                    return userProgressRepository.save(progress);
                });
    }
}
