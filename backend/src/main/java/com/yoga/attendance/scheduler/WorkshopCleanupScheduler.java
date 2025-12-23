package com.yoga.attendance.scheduler;

import com.yoga.attendance.repository.WorkshopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class WorkshopCleanupScheduler {

    @Autowired
    private WorkshopRepository workshopRepository;

    // Run every hour to delete expired workshops
    @Scheduled(cron = "0 0 * * * *")
    public void deleteExpiredWorkshops() {
        try {
            workshopRepository.deleteByEndTimeBefore(LocalDateTime.now());
            System.out.println("Expired workshops cleaned up at: " + LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Error cleaning up workshops: " + e.getMessage());
        }
    }
}
