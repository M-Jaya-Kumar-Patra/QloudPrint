package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.dto.PaymentRequest;
import com.qloudprint.qloudprint_backend.dto.RazorpayVerifyRequest;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RestTemplate restTemplate;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Map<String, Object> createPaymentOrder(PaymentRequest request) {

        int amountInPaise =
                toPaise(request.getAmount());

        String receipt =
                ("QLD_" + UUID.randomUUID()).substring(0, 40);

        JSONObject notes =
                new JSONObject();

        notes.put("customer_name", request.getCustomerName());
        notes.put("customer_email", request.getCustomerEmail());
        notes.put("platform", "QloudPrint");

        JSONObject body =
                new JSONObject();

        body.put("amount", amountInPaise);
        body.put("currency", "INR");
        body.put("receipt", receipt);
        body.put("payment_capture", 1);
        body.put("notes", notes);

        HttpEntity<String> entity =
                new HttpEntity<>(
                        body.toString(),
                        razorpayHeaders()
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        razorpayBaseUrl() + "/orders",
                        entity,
                        String.class
                );

        JSONObject responseBody =
                new JSONObject(response.getBody());

        responseBody.put("key_id", keyId);

        return responseBody.toMap();
    }

    public Map<String, Object> verifyRazorpayPayment(
            RazorpayVerifyRequest request
    ) {

        if (request.getRazorpayOrderId() == null ||
                request.getRazorpayPaymentId() == null ||
                request.getRazorpaySignature() == null) {
            return Map.of(
                    "success", false,
                    "payment_status", "MISSING_REFERENCE",
                    "message", "Payment verification reference missing"
            );
        }

        boolean validSignature =
                isValidSignature(
                        request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(),
                        request.getRazorpaySignature()
                );

        if (!validSignature) {
            return Map.of(
                    "success", false,
                    "payment_status", "SIGNATURE_MISMATCH",
                    "message", "Payment signature verification failed",
                    "orderId", request.getRazorpayOrderId()
            );
        }

        Map<String, Object> paymentStatus =
                verifyPayment(request.getRazorpayOrderId());

        if (!Boolean.TRUE.equals(paymentStatus.get("success"))) {
            return paymentStatus;
        }

        return Map.of(
                "success", true,
                "payment_status", paymentStatus.get("payment_status"),
                "message", "Payment verified",
                "orderId", request.getRazorpayOrderId(),
                "paymentId", request.getRazorpayPaymentId()
        );
    }

    public Map<String, Object> verifyPayment(String orderId) {

        JSONObject order =
                fetchOrder(orderId);

        JSONObject payment =
                findSuccessfulPaymentForOrder(orderId);

        String orderStatus =
                order.optString("status", "UNKNOWN");

        String paymentStatus =
                payment == null
                        ? orderStatus
                        : payment.optString("status", orderStatus);

        boolean paid =
                "paid".equalsIgnoreCase(orderStatus) ||
                        "captured".equalsIgnoreCase(paymentStatus);

        double amountPaid =
                fromPaise(order.optInt("amount_paid", 0));

        return Map.of(
                "success", paid,
                "payment_status", paymentStatus,
                "message", paid ? "Payment verified" : "Payment is not completed",
                "orderId", orderId,
                "paymentId", payment == null ? "" : payment.optString("id", ""),
                "amountPaid", amountPaid
        );
    }

    public Map<String, Object> createRefund(
            String orderId,
            Double amount,
            String refundId,
            String note
    ) {

        JSONObject payment =
                findSuccessfulPaymentForOrder(orderId);

        if (payment == null) {
            throw new RuntimeException("No captured Razorpay payment found for this order");
        }

        JSONObject notes =
                new JSONObject();

        notes.put("reason", note);
        notes.put("qloudprint_refund_id", refundId);

        JSONObject body =
                new JSONObject();

        body.put("amount", toPaise(amount));
        body.put("receipt", refundId);
        body.put("notes", notes);

        HttpEntity<String> entity =
                new HttpEntity<>(
                        body.toString(),
                        razorpayHeaders()
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        razorpayBaseUrl() + "/payments/" + payment.getString("id") + "/refund",
                        entity,
                        String.class
                );

        JSONObject responseBody =
                new JSONObject(response.getBody());

        return Map.of(
                "refundStatus", responseBody.optString("status", "processed"),
                "refundId", responseBody.optString("receipt", refundId),
                "cfRefundId", responseBody.optString("id", ""),
                "refundAmount", fromPaise(responseBody.optInt("amount", toPaise(amount)))
        );
    }

    private JSONObject fetchOrder(String orderId) {

        ResponseEntity<String> response =
                restTemplate.exchange(
                        razorpayBaseUrl() + "/orders/" + orderId,
                        HttpMethod.GET,
                        new HttpEntity<>(razorpayHeaders()),
                        String.class
                );

        return new JSONObject(response.getBody());
    }

    private JSONObject findSuccessfulPaymentForOrder(String orderId) {

        ResponseEntity<String> response =
                restTemplate.exchange(
                        razorpayBaseUrl() + "/orders/" + orderId + "/payments",
                        HttpMethod.GET,
                        new HttpEntity<>(razorpayHeaders()),
                        String.class
                );

        JSONArray payments =
                new JSONObject(response.getBody())
                        .optJSONArray("items");

        if (payments == null) {
            return null;
        }

        for (int index = 0; index < payments.length(); index++) {
            JSONObject payment =
                    payments.getJSONObject(index);

            String status =
                    payment.optString("status");

            if ("captured".equalsIgnoreCase(status)) {
                return payment;
            }
        }

        return null;
    }

    private boolean isValidSignature(
            String orderId,
            String paymentId,
            String receivedSignature
    ) {

        try {
            String payload =
                    orderId + "|" + paymentId;

            Mac mac =
                    Mac.getInstance("HmacSHA256");

            mac.init(
                    new SecretKeySpec(
                            keySecret.getBytes(StandardCharsets.UTF_8),
                            "HmacSHA256"
                    )
            );

            String expectedSignature =
                    HexFormat.of().formatHex(
                            mac.doFinal(payload.getBytes(StandardCharsets.UTF_8))
                    );

            return expectedSignature.equals(receivedSignature);
        } catch (Exception exception) {
            throw new RuntimeException("Unable to verify Razorpay signature", exception);
        }
    }

    private HttpHeaders razorpayHeaders() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(keyId, keySecret);

        return headers;
    }

    private int toPaise(Double amount) {

        if (amount == null || amount <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        return BigDecimal.valueOf(amount)
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }

    private double fromPaise(int amount) {

        return BigDecimal.valueOf(amount)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String razorpayBaseUrl() {

        return "https://api.razorpay.com/v1";
    }
}
