package com.yoga.attendance.controller;

import com.yoga.attendance.entity.Workshop;
import com.yoga.attendance.repository.WorkshopRepository;
import com.yoga.attendance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "*")
public class WorkshopController {

    @Autowired
    private WorkshopRepository workshopRepository;

    @Autowired
    private NotificationService notificationService;

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
            List<Workshop> sessions = workshopRepository
                    .findByLevelAndTypeAndActiveTrueAndEndTimeAfterOrderByStartTimeAsc(
                            level, "session", LocalDateTime.now());
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
}
