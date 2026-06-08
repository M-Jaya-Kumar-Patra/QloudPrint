package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.ShopRecommendationResponse;
import com.qloudprint.qloudprint_backend.dto.ShopRequest;
import com.qloudprint.qloudprint_backend.entity.Shop;
import com.qloudprint.qloudprint_backend.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @PostMapping("/me")
    public Shop saveMyShop(
            @RequestBody ShopRequest request,
            Authentication authentication
    ) {

        return shopService.saveShop(request, authentication.getName());
    }

    @GetMapping("/me")
    public Shop getMyShop(Authentication authentication) {

        return shopService.getMyShop(authentication.getName());
    }

    @GetMapping("/{shopId}")
    public Shop getShopProfile(
            @PathVariable Long shopId
    ) {

        return shopService.getPublicShop(shopId);
    }

    @PostMapping("/upload-photo")
    public Map<String, String> uploadPhoto(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        return shopService.uploadShopPhoto(file);
    }

    @GetMapping("/recommendations")
    public List<ShopRecommendationResponse> recommendations(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Integer pageCount,
            @RequestParam Integer copies,
            @RequestParam Boolean colorPrint,
            Authentication authentication
    ) {

        return shopService.recommendShops(
                latitude,
                longitude,
                pageCount,
                copies,
                colorPrint,
                authentication == null ? null : authentication.getName()
        );
    }
}
