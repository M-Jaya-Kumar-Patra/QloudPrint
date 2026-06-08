package com.qloudprint.qloudprint_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RazorpayVerifyRequest {

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;
}
