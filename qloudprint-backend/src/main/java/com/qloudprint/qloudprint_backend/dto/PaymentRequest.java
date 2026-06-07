package com.qloudprint.qloudprint_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    private Double amount;

    private String customerName;

    private String customerEmail;
}