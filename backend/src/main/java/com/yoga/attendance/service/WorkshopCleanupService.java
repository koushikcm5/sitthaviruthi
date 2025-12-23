package com.yoga.attendance.service;

import com.yoga.attendance.repository.WorkshopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class WorkshopCleanupService {
    
    @Autowired
    private WorkshopRepository workshopRepository;
    
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void deleteExpiredWorkshops() {
        workshopRepository.deleteByEndTimeBefore(LocalDateTime.now());
        System.out.println("Deleted expired workshops at: " + LocalDateTime.now());
    }
}
