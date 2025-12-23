package com.yoga.attendance.controller;

import com.yoga.attendance.entity.*;
import com.yoga.attendance.repository.*;
import com.yoga.attendance.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.yoga.attendance.repository.HealingUploadRepository;
import com.yoga.attendance.entity.HealingUpload;
import com.yoga.attendance.util.FileValidator;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "*")
public class ContentController {

    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private UserLevelRepository userLevelRepository;
    @Autowired
    private DailyRoutineRepository dailyRoutineRepository;
    @Autowired
    private HabitTaskRepository habitTaskRepository;
    @Autowired
    private UserProgressRepository userProgressRepository;
    @Autowired
    private WorkshopRepository workshopRepository;
    @Autowired
    private ManifestationVideoRepository manifestationVideoRepository;
    @Autowired
    private HealingUploadRepository healingUploadRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private FileValidator fileValidator;

    // --- HEALING GALLERY ENDPOINTS ---

    @PostMapping("/user/healing-upload")
    public ResponseEntity<?> uploadHealingPhoto(
            @RequestParam("username") String username,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file) {

        try {
            fileValidator.validateImageFile(file);

            // Save File
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            if (!Files.exists(uploadPath))
                Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = "healing_" + username + "_" + System.currentTimeMillis() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + filename;

            // Save Entity
            HealingUpload upload = new HealingUpload();
            upload.setUsername(username);
            upload.setName(name);
            upload.setDescription(description);
            upload.setPhotoUrl(fileUrl);
            upload.setUploadTimestamp(LocalDateTime.now());
            upload.setExpiryDate(LocalDateTime.now().plusDays(14)); // Expiry in 14 days
            upload.setIsActive(true);

            return ResponseEntity.ok(healingUploadRepository.save(upload));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/healing-uploads")
    public ResponseEntity<?> getAllActiveHealingUploads() {
        // Return only active and non-expired uploads
        return ResponseEntity.ok(healingUploadRepository
                .findByIsActiveTrueAndExpiryDateAfterOrderByUploadTimestampDesc(LocalDateTime.now()));
    }

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

    // Get habit tasks
    @GetMapping("/habits")
    public ResponseEntity<?> getHabitTasks() {
        return ResponseEntity.ok(habitTaskRepository.findByActiveTrue());
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

            // Increment video index if not already at max for this level
            // Note: ideally we check total videos for level, but simply incrementing
            // is a good first step.
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

    // Admin: Add or Update video (like manifestation video)
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

    // Admin: Add routine
    @PostMapping("/admin/routine")
    public ResponseEntity<?> addRoutine(@RequestBody DailyRoutine routine) {
        return ResponseEntity.ok(dailyRoutineRepository.save(routine));
    }

    // Admin: Add habit
    @PostMapping("/admin/habit")
    public ResponseEntity<?> addHabit(@RequestBody HabitTask habit) {
        return ResponseEntity.ok(habitTaskRepository.save(habit));
    }

    // Admin: Update habit
    @PutMapping("/admin/habit/{id}")
    public ResponseEntity<?> updateHabit(@PathVariable Long id, @RequestBody HabitTask habitData) {
        try {
            HabitTask habit = habitTaskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Habit not found"));
            habit.setName(habitData.getName());
            habit.setDescription(habitData.getDescription());
            habit.setActive(true);
            return ResponseEntity.ok(habitTaskRepository.save(habit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Delete habit
    @DeleteMapping("/admin/habit/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable Long id) {
        try {
            habitTaskRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Habit deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Add workshop
    @PostMapping("/admin/workshop")
    public ResponseEntity<?> addWorkshop(@RequestBody Workshop workshop) {
        try {
            System.out.println("Received workshop: " + workshop);
            boolean isNew = workshop.getId() == null;
            Workshop saved = workshopRepository.save(workshop);
            System.out.println("Saved workshop with ID: " + saved.getId());

            // Only notify users about NEW workshops, not updates
            if (isNew) {
                String workshopType = "upcoming".equals(workshop.getType()) ? "Upcoming Workshop" : "Session Workshop";
                notificationService.notifyAllUsers(
                        "New " + workshopType,
                        workshop.getTitle() + " - " + workshop.getDescription(),
                        "WORKSHOP");
                System.out.println("Notification sent for new workshop: " + workshop.getTitle());
            } else {
                System.out.println("Workshop updated, no notification sent: " + workshop.getTitle());
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("Error saving workshop: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Get all workshops (for testing)
    @GetMapping("/admin/workshops")
    public ResponseEntity<?> getAllWorkshops() {
        return ResponseEntity.ok(workshopRepository.findAll());
    }

    // Get workshops by level (only upcoming, not expired)
    @GetMapping("/workshops/{level}")
    public ResponseEntity<?> getWorkshopsByLevel(@PathVariable Integer level) {
        try {
            List<Workshop> workshops = workshopRepository
                    .findByLevelAndTypeAndActiveTrueAndEndTimeAfterOrderByStartTimeAsc(level, "upcoming",
                            LocalDateTime.now());
            return ResponseEntity.ok(workshops);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Get session workshops by level
    @GetMapping("/workshops/sessions/{level}")
    public ResponseEntity<?> getSessionWorkshops(@PathVariable Integer level) {
        try {
            List<Workshop> sessions = workshopRepository.findByLevelAndTypeAndActiveTrue(level, "session");
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Get recent workshop notifications
    @GetMapping("/workshops/notifications")
    public ResponseEntity<?> getWorkshopNotifications() {
        try {
            List<Workshop> workshops = workshopRepository.findTop5ByActiveTrueOrderByCreatedAtDesc();
            return ResponseEntity.ok(workshops);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

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

    // Complete video
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

    // Check if manifestation video exists
    @GetMapping("/admin/manifestation-video-exists")
    public ResponseEntity<?> checkManifestationVideoExists() {
        boolean exists = manifestationVideoRepository.findFirstByOrderByIdDesc().isPresent();
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // Fix habit tasks - create 5 default if none exist
    @PostMapping("/admin/fix-habits")
    public ResponseEntity<?> fixHabitTasks() {
        try {
            List<HabitTask> existing = habitTaskRepository.findAll();
            if (existing.isEmpty()) {
                for (int i = 1; i <= 5; i++) {
                    HabitTask task = new HabitTask();
                    task.setName("Task " + i);
                    task.setDescription("Complete your daily habit " + i);
                    task.setActive(true);
                    habitTaskRepository.save(task);
                }
                return ResponseEntity.ok(Map.of("message", "5 default tasks created successfully"));
            }
            return ResponseEntity.ok(Map.of("message", "Tasks already exist", "count", existing.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
