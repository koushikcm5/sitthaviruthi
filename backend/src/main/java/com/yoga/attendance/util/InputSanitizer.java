package com.yoga.attendance.util;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class InputSanitizer {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[+]?[0-9]{10,15}$"
    );
    
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_]{3,20}$"
    );
    
    public String sanitize(String input) {
        if (input == null) return null;
        return input.trim()
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#x27;")
            .replaceAll("/", "&#x2F;");
    }
    
    public String sanitizeForSql(String input) {
        if (input == null) return null;
        return input.replaceAll("[';\"\\\\]", "");
    }
    
    public boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    public boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone.replaceAll("[\\s-]", "")).matches();
    }
    
    public boolean isValidUsername(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }
    
    public String sanitizeFilename(String filename) {
        if (filename == null) return null;
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
