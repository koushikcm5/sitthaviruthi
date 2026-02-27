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

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner initSuperAdmin(
            com.yoga.attendance.repository.UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            com.yoga.attendance.service.DoctorService doctorService) {
        return args -> {
            if (!userRepository.existsByUsername("superadmin")) {
                com.yoga.attendance.entity.User superAdmin = new com.yoga.attendance.entity.User();
                superAdmin.setName("Super Admin");
                superAdmin.setUsername("superadmin");
                superAdmin.setEmail("superadmin@example.com");
                superAdmin.setPhone("0000000000");
                superAdmin.setPassword(passwordEncoder.encode("SuperAdmin@123"));
                superAdmin.setRole(com.yoga.attendance.entity.User.Role.SUPER_ADMIN);
                superAdmin.setApproved(true);
                superAdmin.setEmailVerified(true);
                userRepository.save(superAdmin);
                System.out.println("Super Admin created: username=superadmin, password=SuperAdmin@123");
            }

            // Initialize default doctors
            doctorService.initializeDefaultDoctors();
        };
    }
}
