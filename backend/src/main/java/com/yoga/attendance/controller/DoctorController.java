package com.yoga.attendance.controller;

import com.yoga.attendance.entity.Doctor;
import com.yoga.attendance.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/active")
    public ResponseEntity<List<Doctor>> getActiveDoctors() {
        return ResponseEntity.ok(doctorService.getAllActiveDoctors());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> addDoctor(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String designation = request.get("designation");

            if (name == null || name.trim().isEmpty() || designation == null || designation.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name and designation are required"));
            }

            Doctor doctor = doctorService.addDoctor(name, designation);
            return ResponseEntity.ok(Map.of("message", "Doctor added successfully", "doctor", doctor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String designation = request.get("designation");

            if (name == null || name.trim().isEmpty() || designation == null || designation.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name and designation are required"));
            }

            Doctor doctor = doctorService.updateDoctor(id, name, designation);
            return ResponseEntity.ok(Map.of("message", "Doctor updated successfully", "doctor", doctor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
