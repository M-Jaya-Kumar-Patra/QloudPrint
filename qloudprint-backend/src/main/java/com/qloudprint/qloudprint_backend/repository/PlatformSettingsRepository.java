package com.qloudprint.qloudprint_backend.repository;

import com.qloudprint.qloudprint_backend.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {
}
