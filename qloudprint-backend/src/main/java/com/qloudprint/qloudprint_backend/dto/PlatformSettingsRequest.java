package com.qloudprint.qloudprint_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PlatformSettingsRequest {

    @Min(0)
    @Max(50)
    private Double platformFeePercent;
}
