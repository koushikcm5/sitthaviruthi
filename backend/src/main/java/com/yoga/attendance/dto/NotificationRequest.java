package com.yoga.attendance.dto;

import lombok.Data;

@Data
public class NotificationRequest {
    private String title;
    private String message;
    private String type; // "general", "alert", etc.
    private String targetUser; // Username, or "ALL_USERS", "ALL_ADMINS"
}
