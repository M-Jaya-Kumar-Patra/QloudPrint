package com.qloudprint.qloudprint_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CashfreeOrderResponse {

    private String payment_session_id;

    private String order_id;
}