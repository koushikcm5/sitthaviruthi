package com.yoga.attendance.dto;

import com.yoga.attendance.entity.Appointment;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class AppointmentDTO {
    private Long id;
    private String username;
    private String reason;
    private String status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime requestedDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledDate;
    private String adminNotes;
    private String doctorName;

    public AppointmentDTO(Appointment appointment) {
        this.id = appointment.getId();
        this.username = appointment.getUser().getUsername();
        this.reason = appointment.getReason();
        this.status = appointment.getStatus();
        this.requestedDate = appointment.getRequestedDate();
        this.scheduledDate = appointment.getScheduledDate();
        this.adminNotes = appointment.getAdminNotes();
        this.doctorName = appointment.getDoctorName();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDateTime requestedDate) {
        this.requestedDate = requestedDate;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }
}
