package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.ManualPayoutRequest;
import com.qloudprint.qloudprint_backend.dto.PlatformSettingsRequest;
import com.qloudprint.qloudprint_backend.entity.OrderStatus;
import com.qloudprint.qloudprint_backend.entity.Role;
import com.qloudprint.qloudprint_backend.repository.PrintOrderRepository;
import com.qloudprint.qloudprint_backend.repository.ShopRepository;
import com.qloudprint.qloudprint_backend.repository.UserRepository;
import com.qloudprint.qloudprint_backend.service.PlatformSettingsService;
import com.qloudprint.qloudprint_backend.service.PayoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final UserRepository userRepository;

    private final ShopRepository shopRepository;

    private final PrintOrderRepository orderRepository;

    private final PlatformSettingsService platformSettingsService;

    private final PayoutService payoutService;

    @GetMapping
    public Map<String, Object> analytics() {

        var orders = orderRepository.findAll();

        double revenue = orders.stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(order -> order.getTotalCost() == null ? 0 : order.getTotalCost())
                .sum();

        double platformEarnings = orders.stream()
                .mapToDouble(order -> order.getPlatformFee() == null ? 0 : order.getPlatformFee())
                .sum();

        double shopPayoutTotal = orders.stream()
                .mapToDouble(order -> order.getShopPayoutAmount() == null ? 0 : order.getShopPayoutAmount())
                .sum();

        double refundedAmount = orders.stream()
                .mapToDouble(order -> order.getRefundAmount() == null ? 0 : order.getRefundAmount())
                .sum();

        long pendingPayouts = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .filter(order -> order.getPayoutStatus() == null ||
                        "RECEIVED".equalsIgnoreCase(order.getPayoutStatus()) ||
                        "QUEUED".equalsIgnoreCase(order.getPayoutStatus()) ||
                        "PENDING".equalsIgnoreCase(order.getPayoutStatus()) ||
                        "PENDING_MANUAL_SETTLEMENT".equalsIgnoreCase(order.getPayoutStatus()))
                .count();

        long failedPayouts = orders.stream()
                .filter(order -> "FAILED".equalsIgnoreCase(order.getPayoutStatus()))
                .count();

        long manuallySettledPayouts = orders.stream()
                .filter(order -> "MANUALLY_SETTLED".equalsIgnoreCase(order.getPayoutStatus()))
                .count();

        long refundFailures = orders.stream()
                .filter(order -> "FAILED".equalsIgnoreCase(order.getRefundStatus()))
                .count();

        Map<String, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus().name(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        long activeOrders = orders.stream()
                .filter(order -> order.getStatus() != OrderStatus.COMPLETED)
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalUsers", userRepository.count());
        response.put("customers", userRepository.countByRole(Role.CUSTOMER));
        response.put("shopkeepers", userRepository.countByRole(Role.SHOPKEEPER));
        response.put("shops", shopRepository.count());
        response.put("orders", orders.size());
        response.put("activeOrders", activeOrders);
        response.put("revenue", revenue);
        response.put("platformEarnings", platformEarnings);
        response.put("shopPayoutTotal", shopPayoutTotal);
        response.put("pendingPayouts", pendingPayouts);
        response.put("failedPayouts", failedPayouts);
        response.put("manuallySettledPayouts", manuallySettledPayouts);
        response.put("refundedAmount", refundedAmount);
        response.put("refundFailures", refundFailures);
        response.put("cancelledOrders", statusCounts.getOrDefault(OrderStatus.CANCELLED.name(), 0L));
        response.put("platformSettings", platformSettingsService.getSettings());
        response.put("statusCounts", statusCounts);
        response.put("averageOrderValue", orders.isEmpty() ? 0 : revenue / orders.size());

        return response;
    }

    @GetMapping("/settings")
    public Object settings() {

        return platformSettingsService.getSettings();
    }

    @PutMapping("/settings")
    public Object updateSettings(
            @Valid @RequestBody PlatformSettingsRequest request
    ) {

        return platformSettingsService.updateSettings(request);
    }

    @GetMapping("/payouts")
    public Object payouts() {

        return orderRepository.findByStatus(OrderStatus.COMPLETED);
    }

    @PostMapping("/payouts/{orderId}/settle")
    public Object settlePayout(
            @PathVariable Long orderId,
            @Valid @RequestBody ManualPayoutRequest request
    ) {

        return payoutService.markManualSettlement(
                orderId,
                request.getPaymentMode(),
                request.getReferenceId(),
                request.getNote()
        );
    }
}
