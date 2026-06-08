package com.qloudprint.qloudprint_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class RateOrderRequest {

    @Min(1)
    @Max(5)
    private Integer rating;

    private String review;
}
