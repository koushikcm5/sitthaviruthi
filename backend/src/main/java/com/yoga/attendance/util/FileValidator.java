package com.yoga.attendance.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Component
public class FileValidator {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !hasAllowedExtension(filename)) {
            throw new IllegalArgumentException("Invalid file extension");
        }
    }

    private boolean hasAllowedExtension(String filename) {
        String lower = filename.toLowerCase();
        return ALLOWED_EXTENSIONS.stream().anyMatch(lower::endsWith);
    }
}
