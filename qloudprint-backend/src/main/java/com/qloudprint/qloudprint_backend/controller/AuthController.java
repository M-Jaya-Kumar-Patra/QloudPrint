package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.ApiResponse;
import com.qloudprint.qloudprint_backend.dto.RegisterRequest;
import com.qloudprint.qloudprint_backend.dto.LoginRequest;
import com.qloudprint.qloudprint_backend.service.AuthService;
import com.qloudprint.qloudprint_backend.dto.AuthResponse;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        String message = authService.register(request);

        ApiResponse<Object> response = new ApiResponse<>(
                true,
                message,
                null
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
}