package com.yoga.attendance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public boolean sendVerificationOtp(String to, String otp) {
        System.out.println("\n=== EMAIL VERIFICATION OTP ===");
        System.out.println("To: " + to);
        System.out.println("OTP: " + otp);
        System.out.println("==============================\n");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify your Yoga App email");
            helper.setText(getVerificationOtpTemplate(otp), true);

            mailSender.send(message);
            System.out.println("✓ Verification OTP email sent successfully to: " + to);
            return true;
        } catch (Exception e) {
            System.err.println("✗ Email sending failed: " + e.getMessage());
            return false;
        }
    }

    public boolean sendPasswordResetOtp(String to, String otp) {
        System.out.println("\n=== PASSWORD RESET OTP ===");
        System.out.println("To: " + to);
        System.out.println("OTP: " + otp);
        System.out.println("==========================\n");

        try {
            if (to == null || !to.contains("@")) {
                System.err.println("✗ Invalid email format");
                return false;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Sittha Viruthi Yoga - Reset Password OTP");
            helper.setText(getResetOtpTemplate(otp), true);

            System.out.println("Attempting to send email...");
            mailSender.send(message);
            System.out.println("✓ Password reset OTP email sent successfully to: " + to);
            return true;

        } catch (Exception e) {
            System.err.println("✗ Email sending failed: " + e.getMessage());
            return false;
        }
    }

    private String getResetOtpTemplate(String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                ".otp-box { background-color: #00A8A8; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; color: #FFF; letter-spacing: 8px; }"
                +
                "</style></head>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2>Reset Your Password</h2>" +
                "<p>Your OTP to reset your password is:</p>" +
                "<div class='otp-box'>" + otp + "</div>" +
                "<p><strong>Steps:</strong></p>" +
                "<ol>" +
                "<li>Open the Yoga App</li>" +
                "<li>Enter this OTP in the verification screen</li>" +
                "<li>Enter your new password</li>" +
                "</ol>" +
                "<p>This OTP will expire in 10 minutes.</p>" +
                "<p>If you didn't request this, please ignore this email.</p>" +
                "</body>" +
                "</html>";
    }

    private String getVerificationOtpTemplate(String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                ".otp-box { background-color: #00A8A8; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; color: #FFF; letter-spacing: 8px; }"
                +
                "</style></head>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
                "<h2>Verify Your Email</h2>" +
                "<p>Your OTP to verify your email is:</p>" +
                "<div class='otp-box'>" + otp + "</div>" +
                "<p><strong>Steps:</strong></p>" +
                "<ol>" +
                "<li>Open the Yoga App</li>" +
                "<li>Enter this OTP in the verification screen</li>" +
                "<li>Click Verify</li>" +
                "</ol>" +
                "<p>This OTP will expire in 10 minutes.</p>" +
                "<p>If you didn't register, please ignore this email.</p>" +
                "</body>" +
                "</html>";
    }
}
