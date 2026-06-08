package com.qloudprint.qloudprint_backend.service;


import com.qloudprint.qloudprint_backend.dto.AuthResponse;
import com.qloudprint.qloudprint_backend.dto.ResetPasswordRequest;
import com.qloudprint.qloudprint_backend.dto.RegisterRequest;
import com.qloudprint.qloudprint_backend.dto.VerifyOtpRequest;
import com.qloudprint.qloudprint_backend.entity.Role;
import com.qloudprint.qloudprint_backend.entity.User;
import com.qloudprint.qloudprint_backend.exception.BadRequestException;
import com.qloudprint.qloudprint_backend.exception.ResourceNotFoundException;
import com.qloudprint.qloudprint_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.qloudprint.qloudprint_backend.security.JwtService;


import com.qloudprint.qloudprint_backend.dto.LoginRequest;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;



    private final BCryptPasswordEncoder passwordEncoder ;

    private final JwtService jwtService;

    private final EmailService emailService;

    private final Random random = new Random();

    public Map<String, String> register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String otp =
                generateOtp();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(resolveRole(request.getRole()))
                .emailVerified(false)
                .otpCode(otp)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                "Verify your QloudPrint email",
                otp,
                "email verification"
        );

        return Map.of(
                "message", "Account created. Verify your email with the OTP sent to your email."
        );
    }

    public AuthResponse login(
            LoginRequest request
    ) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        boolean isPasswordCorrect =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!isPasswordCorrect) {

            throw new BadRequestException(
                    "Invalid email or password"
            );
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Please verify your email before login");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getRole().name()
        );
    }

    private Role resolveRole(String role) {

        if ("SHOPKEEPER".equalsIgnoreCase(role)) {
            return Role.SHOPKEEPER;
        }

        if ("ADMIN".equalsIgnoreCase(role)) {
            return Role.ADMIN;
        }

        return Role.CUSTOMER;
    }

    public Map<String, String> resendVerificationOtp(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return Map.of("message", "Email is already verified");
        }

        String otp =
                refreshOtp(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                "Verify your QloudPrint email",
                otp,
                "email verification"
        );

        return Map.of(
                "message", "Verification OTP sent"
        );
    }

    public String verifyEmail(VerifyOtpRequest request) {

        User user =
                getUserWithValidOtp(request.getEmail(), request.getOtp());

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return "Email verified successfully";
    }

    public Map<String, String> forgotPassword(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        String otp =
                refreshOtp(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                "Reset your QloudPrint password",
                otp,
                "password reset"
        );

        return Map.of(
                "message", "Password reset OTP sent"
        );
    }

    public String resetPassword(ResetPasswordRequest request) {

        User user =
                getUserWithValidOtp(request.getEmail(), request.getOtp());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return "Password updated successfully";
    }

    public User getProfile(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));
    }

    public int deleteStaleUnverifiedUsers() {

        var staleUsers =
                userRepository.findByEmailVerifiedFalseAndLastLoginAtIsNullAndCreatedAtBefore(
                        LocalDateTime.now().minusDays(7)
                );

        userRepository.deleteAll(staleUsers);

        return staleUsers.size();
    }

    private User getUserWithValidOtp(String email, String otp) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        if (user.getOtpCode() == null ||
                !user.getOtpCode().equals(otp) ||
                user.getOtpExpiresAt() == null ||
                user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        return user;
    }

    private String refreshOtp(User user) {

        String otp =
                generateOtp();

        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        return otp;
    }

    private String generateOtp() {

        return String.valueOf(100000 + random.nextInt(900000));
    }
}
