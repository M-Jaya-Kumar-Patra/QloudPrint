package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.CancelOrderRequest;
import com.qloudprint.qloudprint_backend.dto.UpdateOrderStatusRequest;
import com.qloudprint.qloudprint_backend.entity.PrintOrder;
import com.qloudprint.qloudprint_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopkeeper/orders")
@RequiredArgsConstructor
public class ShopkeeperOrderController {

    private final OrderService orderService;

    @GetMapping
    public List<PrintOrder> getAllOrders(Authentication authentication) {

        return orderService.getShopOrders(authentication.getName());
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
    public List<PrintOrder> getOptimizedQueue(Authentication authentication) {

        return orderService.getOptimizedQueue(authentication.getName());
    }

    @GetMapping("/verify/{orderCode}")
    public PrintOrder verifyOrder(
            @PathVariable String orderCode
    ) {

        return orderService
                .verifyOrder(orderCode);
    }

    @PostMapping("/{orderId}/payout/retry")
    public PrintOrder retryPayout(
            @PathVariable Long orderId,
            Authentication authentication
    ) {

        return orderService.retryPayout(
                orderId,
                authentication.getName()
        );
    }

    @PostMapping("/{orderId}/cancel")
    public PrintOrder cancelOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) CancelOrderRequest request,
            Authentication authentication
    ) {

        return orderService.cancelShopOrder(
                orderId,
                request,
                authentication.getName()
        );
    }
}
