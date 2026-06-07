package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.dto.PaymentRequest;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RestTemplate restTemplate;

    @Value("${cashfree.client.id}")
    private String clientId;

    @Value("${cashfree.client.secret}")
    private String clientSecret;

    public String createPaymentOrder(
            PaymentRequest request
    ) {

        String orderId =
                "QLD_" + UUID.randomUUID();

        JSONObject customerDetails =
                new JSONObject();

        customerDetails.put(
                "customer_id",
                UUID.randomUUID().toString()
        );

        customerDetails.put(
                "customer_name",
                request.getCustomerName()
        );

        customerDetails.put(
                "customer_email",
                request.getCustomerEmail()
        );

        customerDetails.put(
                "customer_phone",
                "9999999999"
        );

        JSONObject body =
                new JSONObject();

        JSONObject orderMeta =
                new JSONObject();

        orderMeta.put(
                "return_url",
                "http://localhost:5173/payment-success?order_id={order_id}"
        );

        body.put(
                "order_meta",
                orderMeta
        );

        body.put(
                "order_amount",
                request.getAmount()
        );

        body.put(
                "order_currency",
                "INR"
        );

        body.put(
                "customer_details",
                customerDetails
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        headers.set(
                "x-client-id",
                clientId
        );

        headers.set(
                "x-client-secret",
                clientSecret
        );

        headers.set(
                "x-api-version",
                "2023-08-01"
        );

        HttpEntity<String> entity =
                new HttpEntity<>(
                        body.toString(),
                        headers
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        "https://sandbox.cashfree.com/pg/orders",
                        entity,
                        String.class
                );

        return response.getBody();
    }

    public Map<String, Object> verifyPayment(String orderId) {

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "x-client-id",
                clientId
        );

        headers.set(
                "x-client-secret",
                clientSecret
        );

        headers.set(
                "x-api-version",
                "2023-08-01"
        );

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        "https://sandbox.cashfree.com/pg/orders/" + orderId,
                        HttpMethod.GET,
                        entity,
                        String.class
                );

        JSONObject body =
                new JSONObject(response.getBody());

        String status =
                body.optString("order_status", "UNKNOWN");

        boolean paid =
                "PAID".equalsIgnoreCase(status);

        return Map.of(
                "success", paid,
                "payment_status", status,
                "message", paid ? "Payment verified" : "Payment is not completed",
                "orderId", orderId
        );
    }
}
