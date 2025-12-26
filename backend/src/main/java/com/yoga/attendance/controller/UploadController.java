package com.yoga.attendance.controller;

import com.yoga.attendance.entity.HealingUpload;
import com.yoga.attendance.repository.HealingUploadRepository;
import com.yoga.attendance.util.FileValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private HealingUploadRepository healingUploadRepository;

    @Autowired
    private FileValidator fileValidator;

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
}
