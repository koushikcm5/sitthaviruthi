package com.yoga.attendance.dto;

import lombok.Data;

@Data
public class AttendanceRequest {
    private Boolean attended;
    private String deviceInfo;
}
