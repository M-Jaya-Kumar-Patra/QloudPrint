package com.qloudprint.qloudprint_backend.dto;

import com.qloudprint.qloudprint_backend.entity.Shop;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShopRecommendationResponse {

    private Shop shop;

    private Double distanceKm;

    private Double estimatedPrice;

    private Integer waitingMinutes;

    private Double recommendationScore;

    private String badge;
}
