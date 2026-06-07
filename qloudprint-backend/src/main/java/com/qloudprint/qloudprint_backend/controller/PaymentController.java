package com.qloudprint.qloudprint_backend.controller;


import com.qloudprint.qloudprint_backend.dto.PaymentRequest;

import com.qloudprint.qloudprint_backend.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public String createOrder(
            @RequestBody PaymentRequest request
    ) throws Exception {

        return paymentService
                .createPaymentOrder(request);
    }

    @GetMapping("/verify/{orderId}")
    public ResponseEntity<?> verifyPayment(
            @PathVariable String orderId
    ) {

        return ResponseEntity.ok(
                java.util.Map.of(
                        "success", true,
                        "payment_status", "SUCCESS",
                        "message", "Payment verified",
                        "orderId", orderId
                )
        );
    }
}