package com.yoga.attendance.controller;

import com.yoga.attendance.entity.QA;
import com.yoga.attendance.repository.QARepository;
import com.yoga.attendance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/qa")
@CrossOrigin(origins = "*")
public class QAController {

    @Autowired
    private QARepository qaRepository;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@RequestBody Map<String, String> request) {
        QA qa = new QA();
        qa.setUsername(request.get("username"));
        qa.setQuestion(request.get("question"));
        qa.setStatus("PENDING");
        qaRepository.save(qa);

        // Notify all admins about new question
        notificationService.notifyAllAdmins(
                "New Q&A Question",
                request.get("username") + " asked: " + request.get("question"),
                "ADMIN");

        return ResponseEntity.ok(Map.of("message", "Question submitted successfully"));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<QA>> getUserQuestions(@PathVariable String username) {
        return ResponseEntity.ok(qaRepository.findByUsernameOrderByCreatedAtDesc(username));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<QA>> getAllQuestions() {
        return ResponseEntity.ok(qaRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/admin/answer/{id}")
    public ResponseEntity<?> answerQuestion(@PathVariable Long id, @RequestBody Map<String, String> request) {
        QA qa = qaRepository.findById(id).orElseThrow();
        qa.setAnswer(request.get("answer"));
        qa.setStatus("ANSWERED");
        qa.setAnsweredAt(LocalDateTime.now());
        qaRepository.save(qa);
        
        // Notify user about answer
        String questionPreview = qa.getQuestion().length() > 50 ? 
            qa.getQuestion().substring(0, 50) + "..." : qa.getQuestion();
        notificationService.sendToUser(
            qa.getUsername(),
            "Your Question Answered",
            "Admin replied to: \"" + questionPreview + "\". Check Q&A section.",
            "INFO"
        );
        
        return ResponseEntity.ok(Map.of("message", "Answer submitted successfully"));
    }
}
