package com.qloudprint.qloudprint_backend.service;


import com.qloudprint.qloudprint_backend.dto.AuthResponse;
import com.qloudprint.qloudprint_backend.dto.RegisterRequest;
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

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;



    private final BCryptPasswordEncoder passwordEncoder ;

    private final JwtService jwtService;

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .build();

        userRepository.save(user);

        return "User Registered Successfully";
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

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getRole().name()
        );
    }
}
