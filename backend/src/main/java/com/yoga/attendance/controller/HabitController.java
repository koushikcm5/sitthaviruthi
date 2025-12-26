package com.yoga.attendance.controller;

import com.yoga.attendance.entity.HabitTask;
import com.yoga.attendance.repository.HabitTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "*")
public class HabitController {

    @Autowired
    private HabitTaskRepository habitTaskRepository;

    // Get habit tasks
    @GetMapping("/habits")
    public ResponseEntity<?> getHabitTasks() {
        return ResponseEntity.ok(habitTaskRepository.findByActiveTrue());
    }

    // Admin: Add habit
    @PostMapping("/admin/habit")
    public ResponseEntity<?> addHabit(@RequestBody HabitTask habit) {
        return ResponseEntity.ok(habitTaskRepository.save(habit));
    }

    // Admin: Update habit
    @PutMapping("/admin/habit/{id}")
    public ResponseEntity<?> updateHabit(@PathVariable Long id, @RequestBody HabitTask habitData) {
        try {
            HabitTask habit = habitTaskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Habit not found"));
            habit.setName(habitData.getName());
            habit.setDescription(habitData.getDescription());
            habit.setActive(true);
            return ResponseEntity.ok(habitTaskRepository.save(habit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Delete habit
    @DeleteMapping("/admin/habit/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable Long id) {
        try {
            habitTaskRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Habit deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Fix habit tasks - create 5 default if none exist
    @PostMapping("/admin/fix-habits")
    public ResponseEntity<?> fixHabitTasks() {
        try {
            List<HabitTask> existing = habitTaskRepository.findAll();
            if (existing.isEmpty()) {
                for (int i = 1; i <= 5; i++) {
                    HabitTask task = new HabitTask();
                    task.setName("Task " + i);
                    task.setDescription("Complete your daily habit " + i);
                    task.setActive(true);
                    habitTaskRepository.save(task);
                }
                return ResponseEntity.ok(Map.of("message", "5 default tasks created successfully"));
            }
            return ResponseEntity.ok(Map.of("message", "Tasks already exist", "count", existing.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
