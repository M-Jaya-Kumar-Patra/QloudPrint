package com.qloudprint.qloudprint_backend.controller;


import com.qloudprint.qloudprint_backend.dto.PaymentRequest;
import com.qloudprint.qloudprint_backend.dto.RazorpayVerifyRequest;

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
    public ResponseEntity<?> createOrder(
            @RequestBody PaymentRequest request
    ) throws Exception {

        return ResponseEntity.ok(
                paymentService.createPaymentOrder(request)
        );
    }

    @GetMapping("/verify/{orderId}")
    public ResponseEntity<?> verifyPayment(
            @PathVariable String orderId
    ) {

        return ResponseEntity.ok(
                paymentService.verifyPayment(orderId)
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyRazorpayPayment(
            @RequestBody RazorpayVerifyRequest request
    ) {

        return ResponseEntity.ok(
                paymentService.verifyRazorpayPayment(request)
        );
    }
}
