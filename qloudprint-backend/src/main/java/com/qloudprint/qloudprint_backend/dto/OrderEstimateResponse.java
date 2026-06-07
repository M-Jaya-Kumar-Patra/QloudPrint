package com.qloudprint.qloudprint_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class OrderEstimateResponse {

    private Integer pageCount;

    private Integer totalPages;

    private Integer estimatedMinutes;

    private Double totalCost;
}