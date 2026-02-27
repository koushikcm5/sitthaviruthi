package com.yoga.attendance.service;

import com.yoga.attendance.entity.Doctor;
import com.yoga.attendance.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<Doctor> getAllActiveDoctors() {
        return doctorRepository.findByActiveTrueOrderByNameAsc();
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Transactional
    public Doctor addDoctor(String name, String designation) {
        Doctor doctor = new Doctor();
        doctor.setName(name);
        doctor.setDesignation(designation);
        doctor.setActive(true);
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor updateDoctor(Long id, String name, String designation) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setName(name);
        doctor.setDesignation(designation);
        doctor.setUpdatedAt(LocalDateTime.now());
        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setActive(false);
        doctor.setUpdatedAt(LocalDateTime.now());
        doctorRepository.save(doctor);
    }

    @Transactional
    public void initializeDefaultDoctors() {
        if (doctorRepository.count() == 0) {
            addDoctor("Dr. Vivekananthan", "Yoga");
            addDoctor("Dr. Vivekananthan", "Meditation");
            addDoctor("Dr. Vivekananthan", "Wellness");
        }
    }
}
