package com.yoga.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YogaAttendanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(YogaAttendanceApplication.class, args);
    }
}
