package com.yoga.attendance.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.*;
import com.yoga.attendance.entity.DeviceToken;
import com.yoga.attendance.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FCMService {
    
    private final DeviceTokenRepository deviceTokenRepository;
    
    @Value("${fcm.credentials.path:}")
    private String credentialsPath;
    
    @Value("${fcm.enabled:false}")
    private boolean fcmEnabled;
    
    @PostConstruct
    public void initialize() {
        if (!fcmEnabled || credentialsPath.isEmpty()) {
            System.out.println("FCM is disabled or credentials not configured");
            return;
        }
        
        try {
            FileInputStream serviceAccount = new FileInputStream(credentialsPath);
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
            System.out.println("FCM initialized successfully");
        } catch (Exception e) {
            System.err.println("Failed to initialize FCM: " + e.getMessage());
        }
    }
    
    public void sendToUser(String username, String title, String body, String type) {
        if (!fcmEnabled) return;
        
        List<DeviceToken> tokens = deviceTokenRepository.findByUsername(username);
        tokens.forEach(deviceToken -> sendNotification(deviceToken.getToken(), title, body, type));
    }
    
    public void sendToAllUsers(String title, String body, String type) {
        if (!fcmEnabled) return;
        
        List<DeviceToken> tokens = deviceTokenRepository.findAll();
        tokens.forEach(deviceToken -> sendNotification(deviceToken.getToken(), title, body, type));
    }
    
    private void sendNotification(String token, String title, String body, String type) {
        try {
            Message message = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("type", type)
                    .setToken(token)
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent message: " + response);
        } catch (Exception e) {
            System.err.println("Failed to send FCM notification: " + e.getMessage());
        }
    }
}
