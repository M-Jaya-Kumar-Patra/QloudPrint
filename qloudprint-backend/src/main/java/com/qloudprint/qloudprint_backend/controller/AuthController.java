package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.ApiResponse;
import com.qloudprint.qloudprint_backend.dto.OtpRequest;
import com.qloudprint.qloudprint_backend.dto.RegisterRequest;
import com.qloudprint.qloudprint_backend.dto.LoginRequest;
import com.qloudprint.qloudprint_backend.dto.ResetPasswordRequest;
import com.qloudprint.qloudprint_backend.dto.VerifyOtpRequest;
import com.qloudprint.qloudprint_backend.service.AuthService;
import com.qloudprint.qloudprint_backend.dto.AuthResponse;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        Map<String, String> result = authService.register(request);

        ApiResponse<Object> response = new ApiResponse<>(
                true,
                result.get("message"),
                result
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(
            @Valid @RequestBody LoginRequest request
    ) {

        AuthResponse authResponse =
                authService.login(request);

        ApiResponse<Object> response =
                new ApiResponse<>(

                        true,

                        "Login successful",

                        authResponse
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Object>> verifyEmail(
            @Valid @RequestBody VerifyOtpRequest request
    ) {

        String message = authService.verifyEmail(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, message, null)
        );
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Object>> resendVerification(
            @Valid @RequestBody OtpRequest request
    ) {

        Map<String, String> result =
                authService.resendVerificationOtp(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse<>(true, result.get("message"), result)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(
            @Valid @RequestBody OtpRequest request
    ) {

        Map<String, String> result =
                authService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse<>(true, result.get("message"), result)
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        String message =
                authService.resetPassword(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, message, null)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> me(Authentication authentication) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Profile loaded",
                        authService.getProfile(authentication.getName())
                )
        );
    }

    @DeleteMapping("/cleanup-unverified")
    public ResponseEntity<ApiResponse<Object>> cleanupUnverified() {

        int deleted =
                authService.deleteStaleUnverifiedUsers();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Deleted stale unverified accounts",
                        Map.of("deleted", deleted)
                )
        );
    }
}
