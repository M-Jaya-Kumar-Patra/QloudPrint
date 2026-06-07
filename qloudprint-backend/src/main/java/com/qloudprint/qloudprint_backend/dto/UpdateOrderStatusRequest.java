package com.qloudprint.qloudprint_backend.dto;

import com.qloudprint.qloudprint_backend.entity.OrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    private OrderStatus status;
}