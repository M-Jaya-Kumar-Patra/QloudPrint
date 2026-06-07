package com.qloudprint.qloudprint_backend.repository;

import com.qloudprint.qloudprint_backend.entity.User;
import com.qloudprint.qloudprint_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);
}
