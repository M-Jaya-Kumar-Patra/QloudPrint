package com.qloudprint.qloudprint_backend.repository;

import com.qloudprint.qloudprint_backend.entity.Shop;
import com.qloudprint.qloudprint_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    List<Shop> findByOpenNowTrueAndVerifiedTrue();

    Optional<Shop> findByOwner(User owner);
}
