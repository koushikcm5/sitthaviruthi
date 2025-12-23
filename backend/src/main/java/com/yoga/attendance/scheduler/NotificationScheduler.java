package com.yoga.attendance.scheduler;

import com.yoga.attendance.entity.Workshop;
import com.yoga.attendance.repository.WorkshopRepository;
import com.yoga.attendance.repository.UserRepository;
import com.yoga.attendance.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final NotificationService notificationService;
    private final WorkshopRepository workshopRepository;
    private final UserRepository userRepository;

    // Workshop reminders disabled - users get notification when workshop is created
    // @Scheduled(fixedRate = 300000) // Every 5 minutes
    // public void sendWorkshopReminders() {
    //     LocalDateTime now = LocalDateTime.now();
    //     LocalDateTime oneHourLater = now.plusHours(1);

    //     List<Workshop> upcomingWorkshops = workshopRepository.findAll().stream()
    //             .filter(w -> w.getStartTime() != null &&
    //                     w.getStartTime().isAfter(now) &&
    //                     w.getStartTime().isBefore(oneHourLater))
    //             .toList();

    //     upcomingWorkshops.forEach(workshop -> {
    //         userRepository.findAll().forEach(user -> {
    //             if (user.getRole().name().equals("USER")) {
    //                 notificationService.sendWorkshopReminder(
    //                         user.getUsername(),
    //                         workshop.getTitle(),
    //                         workshop.getStartTime().toString());
    //             }
    //         });
    //     });
    // }

    // Daily attendance reminder disabled - handled by app open event
    // @Scheduled(cron = "0 0 9 * * *")
    // public void sendDailyAttendanceReminder() {
    //     userRepository.findAll().forEach(user -> {
    //         if (user.getRole().name().equals("USER")) {
    //             notificationService.sendAttendanceReminder(user.getUsername());
    //         }
    //     });
    // }
}
