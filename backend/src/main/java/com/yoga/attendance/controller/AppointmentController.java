package com.yoga.attendance.controller;

import com.yoga.attendance.dto.AppointmentDTO;
import com.yoga.attendance.entity.Appointment;
import com.yoga.attendance.repository.AppointmentRepository;
import com.yoga.attendance.repository.UserRepository;
import com.yoga.attendance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/request")
    public ResponseEntity<?> requestAppointment(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String reason = request.get("reason");
            String doctorName = request.get("doctorName");
            System.out.println("Appointment request from: " + username + ", doctor: " + doctorName + ", reason: " + reason);

            var userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                System.err.println("User not found: " + username);
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Appointment appointment = new Appointment();
            appointment.setUser(userOpt.get());
            appointment.setReason(reason);
            appointment.setDoctorName(doctorName);
            appointment.setStatus("PENDING");
            appointment.setRequestedDate(LocalDateTime.now());

            Appointment saved = appointmentRepository.save(appointment);
            System.out.println("Appointment saved with ID: " + saved.getId());

            // Notify all admins about new appointment request
            notificationService.notifyAllAdmins(
                    "New Appointment Request",
                    username + " has requested an appointment with " + doctorName + ": " + reason,
                    "ADMIN");

            return ResponseEntity.ok(Map.of("message", "Appointment request submitted", "id", saved.getId()));
        } catch (Exception e) {
            System.err.println("Error saving appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to save appointment: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserAppointments(@PathVariable String username) {
        try {
            var userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            List<Appointment> appointments = appointmentRepository.findByUserOrderByRequestedDateDesc(userOpt.get());
            List<AppointmentDTO> dtos = appointments.stream()
                    .map(AppointmentDTO::new)
                    .collect(Collectors.toList());
            System.out.println("Returning " + dtos.size() + " appointments for user: " + username);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Error fetching user appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentRepository.findAllByOrderByRequestedDateDesc();
            System.out.println("Found " + appointments.size() + " appointments");
            List<AppointmentDTO> dtos = appointments.stream()
                    .map(AppointmentDTO::new)
                    .collect(Collectors.toList());
            System.out.println("Converted to " + dtos.size() + " DTOs");
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Error fetching appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @PutMapping("/admin/approve/{id}")
    public ResponseEntity<?> approveAppointment(@PathVariable Long id, @RequestBody Map<String, String> request) {
        var appointment = appointmentRepository.findById(id);
        if (appointment.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Appointment not found"));
        }

        Appointment apt = appointment.get();
        apt.setStatus("APPROVED");
        apt.setScheduledDate(LocalDateTime.parse(request.get("scheduledDate")));
        apt.setAdminNotes(request.get("adminNotes"));

        appointmentRepository.save(apt);
        
        // Notify user about approval
        notificationService.sendToUser(
            apt.getUser().getUsername(),
            "Appointment Approved",
            "Your appointment has been approved and scheduled for " + apt.getScheduledDate().toLocalDate(),
            "INFO"
        );
        
        return ResponseEntity.ok(Map.of("message", "Appointment approved"));
    }

    @PutMapping("/admin/reject/{id}")
    public ResponseEntity<?> rejectAppointment(@PathVariable Long id, @RequestBody Map<String, String> request) {
        var appointment = appointmentRepository.findById(id);
        if (appointment.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Appointment not found"));
        }

        Appointment apt = appointment.get();
        apt.setStatus("REJECTED");
        apt.setAdminNotes(request.get("adminNotes"));

        appointmentRepository.save(apt);
        
        // Notify user about rejection
        String notes = request.get("adminNotes");
        notificationService.sendToUser(
            apt.getUser().getUsername(),
            "Appointment Declined",
            "Your appointment request has been declined." + (notes != null ? " Reason: " + notes : ""),
            "WARNING"
        );
        
        return ResponseEntity.ok(Map.of("message", "Appointment rejected"));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        appointmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Appointment deleted"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            long count = appointmentRepository.count();
            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "appointmentCount", count,
                    "message", "Appointments system is working"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "status", "ERROR",
                    "message", e.getMessage()));
        }
    }
}
