package com.qloudprint.qloudprint_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shopkeeper")
public class ShopkeeperController {

    @GetMapping("/dashboard")
    public String shopkeeperDashboard() {

        return "Shopkeeper Dashboard";
    }
}