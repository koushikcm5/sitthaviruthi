package com.yoga.attendance.repository;

import com.yoga.attendance.entity.Appointment;
import com.yoga.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserOrderByRequestedDateDesc(User user);
    List<Appointment> findAllByOrderByRequestedDateDesc();
}
