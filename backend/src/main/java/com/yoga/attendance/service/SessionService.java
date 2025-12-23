package com.yoga.attendance.service;

import com.yoga.attendance.entity.UserSession;
import com.yoga.attendance.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SessionService {
    
    private final UserSessionRepository sessionRepository;
    
    public UserSession createSession(String username, String token, String deviceInfo, String ipAddress) {
        UserSession session = new UserSession();
        session.setUsername(username);
        session.setSessionToken(token);
        session.setDeviceInfo(deviceInfo);
        session.setIpAddress(ipAddress);
        return sessionRepository.save(session);
    }
    
    public void updateActivity(String token) {
        sessionRepository.findBySessionToken(token).ifPresent(session -> {
            session.setLastActivity(LocalDateTime.now());
            sessionRepository.save(session);
        });
    }
    
    public List<Map<String, Object>> getActiveSessions(String username) {
        List<UserSession> sessions = sessionRepository.findByUsernameAndActiveTrue(username);
        return sessions.stream().map(session -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", session.getId());
            map.put("deviceInfo", session.getDeviceInfo());
            map.put("ipAddress", session.getIpAddress());
            map.put("createdAt", session.getCreatedAt());
            map.put("lastActivity", session.getLastActivity());
            return map;
        }).toList();
    }
    
    @Transactional
    public void logoutSession(Long sessionId) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });
    }
    
    @Transactional
    public void logoutAllSessions(String username) {
        List<UserSession> sessions = sessionRepository.findByUsernameAndActiveTrue(username);
        sessions.forEach(session -> session.setActive(false));
        sessionRepository.saveAll(sessions);
    }
}
