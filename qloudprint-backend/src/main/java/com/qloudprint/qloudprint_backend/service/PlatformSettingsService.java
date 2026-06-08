package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.dto.PlatformSettingsRequest;
import com.qloudprint.qloudprint_backend.entity.PlatformSettings;
import com.qloudprint.qloudprint_backend.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    private static final Long SETTINGS_ID = 1L;

    private final PlatformSettingsRepository settingsRepository;

    @Value("${platform.fee.percent:10}")
    private Double defaultPlatformFeePercent;

    public PlatformSettings getSettings() {

        return settingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> settingsRepository.save(
                        PlatformSettings.builder()
                                .id(SETTINGS_ID)
                                .platformFeePercent(defaultPlatformFeePercent)
                                .build()
                ));
    }

    public PlatformSettings updateSettings(PlatformSettingsRequest request) {

        PlatformSettings settings =
                getSettings();

        settings.setPlatformFeePercent(request.getPlatformFeePercent());

        return settingsRepository.save(settings);
    }

    public Double getPlatformFeePercent() {

        return getSettings().getPlatformFeePercent();
    }
}
