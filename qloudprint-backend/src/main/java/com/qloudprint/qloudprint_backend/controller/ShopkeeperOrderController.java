package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.UpdateOrderStatusRequest;
import com.qloudprint.qloudprint_backend.entity.PrintOrder;
import com.qloudprint.qloudprint_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopkeeper/orders")
@RequiredArgsConstructor
public class ShopkeeperOrderController {

    private final OrderService orderService;

    @GetMapping
    public List<PrintOrder> getAllOrders() {

        return orderService.getAllOrders();
    }

    @PutMapping("/{orderId}/status")
    public PrintOrder updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request
    ) {

        return orderService.updateOrderStatus(
                orderId,
                request
        );
    }

    @GetMapping("/optimized-queue")
    public List<PrintOrder> getOptimizedQueue() {

        return orderService.getOptimizedQueue();
    }

    @GetMapping("/verify/{orderCode}")
    public PrintOrder verifyOrder(
            @PathVariable String orderCode
    ) {

        return orderService
                .verifyOrder(orderCode);
    }
}