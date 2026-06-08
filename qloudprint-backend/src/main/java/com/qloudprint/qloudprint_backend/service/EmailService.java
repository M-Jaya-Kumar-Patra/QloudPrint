package com.qloudprint.qloudprint_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String subject, String otp, String purpose) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(
                "Hello,\n\n" +
                        "Your QloudPrint OTP for " + purpose + " is: " + otp + "\n\n" +
                        "This OTP is valid for 10 minutes.\n\n" +
                        "If you did not request this, you can ignore this email.\n\n" +
                        "Regards,\n" +
                        "QloudPrint Team"
        );

        mailSender.send(message);
    }
}
