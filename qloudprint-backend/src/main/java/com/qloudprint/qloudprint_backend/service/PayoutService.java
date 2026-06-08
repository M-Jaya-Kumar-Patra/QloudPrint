package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.entity.PrintOrder;
import com.qloudprint.qloudprint_backend.entity.OrderStatus;
import com.qloudprint.qloudprint_backend.repository.PrintOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PayoutService {

    private final PrintOrderRepository orderRepository;

    private final PlatformSettingsService platformSettingsService;

    public PrintOrder initiatePayoutForOrder(PrintOrder order) {

        if (order.getShop() == null) {
            return markFailed(order, "Shop is missing for this order");
        }

        if (order.getTotalCost() == null || order.getTotalCost() < 1) {
            return markFailed(order, "Order amount is too low for settlement");
        }

        if (order.getPayoutStatus() != null && !"FAILED".equalsIgnoreCase(order.getPayoutStatus())) {
            return order;
        }

        BigDecimal gross =
                BigDecimal.valueOf(order.getTotalCost());

        BigDecimal fee =
                gross.multiply(BigDecimal.valueOf(platformSettingsService.getPlatformFeePercent()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal payoutAmount =
                gross.subtract(fee).setScale(2, RoundingMode.HALF_UP);

        if (payoutAmount.compareTo(BigDecimal.ONE) < 0) {
            return markFailed(order, "Settlement amount must be at least Rs 1");
        }

        String transferId =
                ("QLD_SETTLEMENT_" + order.getId()).replaceAll("[^A-Za-z0-9_]", "_");

        order.setPlatformFee(fee.doubleValue());
        order.setShopPayoutAmount(payoutAmount.doubleValue());
        order.setPayoutTransferId(transferId);
        order.setPayoutCfTransferId(null);
        order.setPayoutStatus("PENDING_MANUAL_SETTLEMENT");
        order.setPayoutFailureReason("Admin must manually settle this amount to the shop bank account or UPI ID.");

        return orderRepository.save(order);
    }

    public PrintOrder markManualSettlement(
            Long orderId,
            String paymentMode,
            String referenceId,
            String note
    ) {

        PrintOrder order =
                orderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("Only completed orders can be settled");
        }

        if (order.getShopPayoutAmount() == null || order.getPlatformFee() == null) {
            order =
                    initiatePayoutForOrder(order);
        }

        order.setPayoutStatus("MANUALLY_SETTLED");
        order.setPayoutFailureReason(null);
        order.setManualPayoutMode(paymentMode);
        order.setManualPayoutReferenceId(referenceId);
        order.setManualPayoutNote(note);
        order.setManualPayoutSettledAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    private PrintOrder markFailed(PrintOrder order, String reason) {

        order.setPayoutStatus("FAILED");
        order.setPayoutFailureReason(reason);

        return orderRepository.save(order);
    }
}
