package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.dto.ShopRecommendationResponse;
import com.qloudprint.qloudprint_backend.dto.ShopRequest;
import com.qloudprint.qloudprint_backend.entity.OrderStatus;
import com.qloudprint.qloudprint_backend.entity.Shop;
import com.qloudprint.qloudprint_backend.entity.User;
import com.qloudprint.qloudprint_backend.repository.PrintOrderRepository;
import com.qloudprint.qloudprint_backend.repository.ShopRepository;
import com.qloudprint.qloudprint_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;

    private final UserRepository userRepository;

    private final PrintOrderRepository orderRepository;

    private final Cloudinary cloudinary;

    public Shop saveShop(ShopRequest request, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Shop shop = shopRepository.findByOwner(owner)
                .orElseGet(Shop::new);

        shop.setOwner(owner);
        shop.setName(request.getName());
        shop.setAddress(request.getAddress());
        shop.setPhone(request.getPhone());
        shop.setLatitude(request.getLatitude());
        shop.setLongitude(request.getLongitude());
        shop.setOpeningTime(request.getOpeningTime());
        shop.setClosingTime(request.getClosingTime());
        shop.setOpenNow(request.getOpenNow() == null || request.getOpenNow());
        shop.setVerified(true);
        shop.setColorPrinting(request.getColorPrinting() == null || request.getColorPrinting());
        shop.setBinding(Boolean.TRUE.equals(request.getBinding()));
        shop.setLamination(Boolean.TRUE.equals(request.getLamination()));
        shop.setStapling(Boolean.TRUE.equals(request.getStapling()));
        shop.setSpiralBinding(Boolean.TRUE.equals(request.getSpiralBinding()));
        shop.setStickFile(Boolean.TRUE.equals(request.getStickFile()));
        shop.setHardBinding(Boolean.TRUE.equals(request.getHardBinding()));
        shop.setSoftBinding(Boolean.TRUE.equals(request.getSoftBinding()));
        shop.setBwPricePerPage(defaultDouble(request.getBwPricePerPage(), 2.0));
        shop.setColorPricePerPage(defaultDouble(request.getColorPricePerPage(), 5.0));
        shop.setDuplexPricePerPage(defaultDouble(request.getDuplexPricePerPage(), 0.5));
        shop.setStaplePrice(defaultDouble(request.getStaplePrice(), 5.0));
        shop.setSpiralBindingPrice(defaultDouble(request.getSpiralBindingPrice(), 30.0));
        shop.setStickFilePrice(defaultDouble(request.getStickFilePrice(), 15.0));
        shop.setHardBindingPrice(defaultDouble(request.getHardBindingPrice(), 80.0));
        shop.setSoftBindingPrice(defaultDouble(request.getSoftBindingPrice(), 45.0));
        shop.setAveragePagesPerMinute(defaultInteger(request.getAveragePagesPerMinute(), 10));
        shop.setPrintSecondsPerPage(defaultInteger(request.getPrintSecondsPerPage(), 6));
        shop.setPlanName(request.getPlanName());
        shop.setShopPhotoUrl(request.getShopPhotoUrl());
        shop.setStaplePhotoUrl(request.getStaplePhotoUrl());
        shop.setSpiralBindingPhotoUrl(request.getSpiralBindingPhotoUrl());
        shop.setStickFilePhotoUrl(request.getStickFilePhotoUrl());
        shop.setHardBindingPhotoUrl(request.getHardBindingPhotoUrl());
        shop.setSoftBindingPhotoUrl(request.getSoftBindingPhotoUrl());
        shop.setBankAccountHolder(request.getBankAccountHolder());
        shop.setBankAccountNumber(request.getBankAccountNumber());
        shop.setBankIfsc(request.getBankIfsc());
        shop.setUpiId(request.getUpiId());
        shop.setGstNumber(request.getGstNumber());

        if (shop.getRating() == null) {
            shop.setRating(4.5);
            shop.setTotalRatings(0);
        }

        return shopRepository.save(shop);
    }

    public Shop getMyShop(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return shopRepository.findByOwner(owner)
                .orElse(null);
    }

    public Map<String, String> uploadShopPhoto(MultipartFile file) throws IOException {

        Map uploadResult =
                cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "resource_type", "image",
                                "folder", "qloudprint/shops",
                                "use_filename", true,
                                "unique_filename", true
                        )
                );

        return Map.of(
                "url",
                uploadResult.get("secure_url").toString()
        );
    }

    public List<ShopRecommendationResponse> recommendShops(
            Double latitude,
            Double longitude,
            Integer pageCount,
            Integer copies,
            Boolean colorPrint
    ) {

        int totalPages = defaultInteger(pageCount, 1) * defaultInteger(copies, 1);

        return shopRepository.findByOpenNowTrueAndVerifiedTrue()
                .stream()
                .filter(shop -> !Boolean.TRUE.equals(colorPrint) || Boolean.TRUE.equals(shop.getColorPrinting()))
                .map(shop -> buildRecommendation(shop, latitude, longitude, totalPages, Boolean.TRUE.equals(colorPrint)))
                .sorted(Comparator.comparing(ShopRecommendationResponse::getRecommendationScore).reversed())
                .toList();
    }

    private ShopRecommendationResponse buildRecommendation(
            Shop shop,
            Double latitude,
            Double longitude,
            int totalPages,
            boolean colorPrint
    ) {

        double distanceKm = calculateDistanceKm(latitude, longitude, shop.getLatitude(), shop.getLongitude());
        int queueMinutes = orderRepository
                .findByShopAndStatusIn(shop, List.of(
                        OrderStatus.PAYMENT_CONFIRMED,
                        OrderStatus.QUEUED,
                        OrderStatus.PRINTING
                ))
                .stream()
                .mapToInt(order -> order.getEstimatedMinutes() == null ? 0 : order.getEstimatedMinutes())
                .sum();

        int speed = defaultInteger(shop.getAveragePagesPerMinute(), 10);
        int ownMinutes = Math.max(1, (int) Math.ceil((double) totalPages / speed));
        int waitingMinutes = queueMinutes + ownMinutes;
        double price = totalPages * (colorPrint ? defaultDouble(shop.getColorPricePerPage(), 5.0) : defaultDouble(shop.getBwPricePerPage(), 2.0));

        double distanceScore = Math.max(0, 100 - distanceKm * 12);
        double waitScore = Math.max(0, 100 - waitingMinutes * 2);
        double priceScore = Math.max(0, 100 - price / 2);
        double ratingScore = defaultDouble(shop.getRating(), 4.0) * 20;
        double score = distanceScore * 0.30 + waitScore * 0.30 + priceScore * 0.25 + ratingScore * 0.15;

        return ShopRecommendationResponse.builder()
                .shop(shop)
                .distanceKm(round(distanceKm))
                .estimatedPrice(round(price))
                .waitingMinutes(waitingMinutes)
                .recommendationScore(round(score))
                .badge(resolveBadge(distanceKm, waitingMinutes, price, score))
                .build();
    }

    private String resolveBadge(double distanceKm, int waitingMinutes, double price, double score) {

        if (score >= 85) {
            return "Recommended";
        }
        if (waitingMinutes <= 10) {
            return "Fastest";
        }
        if (distanceKm <= 1.5) {
            return "Nearest";
        }
        if (price <= 60) {
            return "Best Value";
        }
        return "Reliable Choice";
    }

    private double calculateDistanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {

        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 5.0;
        }

        double earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadiusKm * c;
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }

    private double defaultDouble(Double value, double fallback) {

        return value == null ? fallback : value;
    }

    private int defaultInteger(Integer value, int fallback) {

        return value == null ? fallback : value;
    }
}
