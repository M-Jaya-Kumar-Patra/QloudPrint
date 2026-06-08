package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.dto.CancelOrderRequest;
import com.qloudprint.qloudprint_backend.dto.OrderEstimateResponse;
import com.qloudprint.qloudprint_backend.dto.OrderRequest;
import com.qloudprint.qloudprint_backend.dto.RateOrderRequest;
import com.qloudprint.qloudprint_backend.dto.TempUploadResponse;
import com.qloudprint.qloudprint_backend.dto.UpdateOrderStatusRequest;
import com.qloudprint.qloudprint_backend.entity.*;
import com.qloudprint.qloudprint_backend.repository.PrintOrderRepository;
import com.qloudprint.qloudprint_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PrintOrderRepository orderRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final Cloudinary cloudinary;

    private final com.qloudprint.qloudprint_backend.repository.ShopRepository shopRepository;

    private final PaymentService paymentService;

    private final PayoutService payoutService;

    public PrintOrder createOrder(
            OrderRequest request,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (request.getPaymentOrderId() == null || request.getPaymentOrderId().isBlank()) {
            throw new RuntimeException("Payment confirmation is required before creating an order");
        }

        Map<String, Object> paymentStatus =
                paymentService.verifyPayment(request.getPaymentOrderId());

        if (!Boolean.TRUE.equals(paymentStatus.get("success"))) {
            throw new RuntimeException("Payment failed or is not completed");
        }

        int totalPages =
                request.getPageCount()
                        * request.getCopies();

        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() ->
                        new RuntimeException("Shop not found"));

        int estimatedMinutes =
                Math.max(
                        1,
                        (int) Math.ceil(
                                (totalPages * (double) (
                                        shop.getPrintSecondsPerPage() == null
                                                ? 6
                                                : shop.getPrintSecondsPerPage()
                                )) / 60.0
                        )
                );

        double costPerPage =
                request.getColorPrint()
                        ? shop.getColorPricePerPage()
                        : shop.getBwPricePerPage();

        if ("DOUBLE_SIDED".equalsIgnoreCase(request.getPrintSide())) {
            costPerPage += shop.getDuplexPricePerPage() == null
                    ? 0.5
                    : shop.getDuplexPricePerPage();
        }

        double totalCost =
                totalPages * costPerPage;

        double bindingCost =
                calculateBindingCost(
                        shop,
                        request.getBindingType()
                );

        totalCost += bindingCost;

        double amountPaid =
                Double.parseDouble(String.valueOf(paymentStatus.getOrDefault("amountPaid", 0)));

        if (amountPaid + 0.01 < totalCost) {
            throw new RuntimeException("Paid amount is lower than the calculated order total");
        }

        int priorityScore =
                estimatedMinutes;

        if (Boolean.TRUE.equals(
                request.getColorPrint()
        )) {

            priorityScore += 5;
        }

        String orderCode =
                "QLD-" +
                        (System.currentTimeMillis()
                                % 1000000);

        PrintOrder order = PrintOrder.builder()

                .fileName(request.getFileName())

                .fileUrl(request.getFileUrl())

                .copies(request.getCopies())

                .colorPrint(request.getColorPrint())

                .paperSize(request.getPaperSize())

                .printSide(request.getPrintSide())

                .bindingType(request.getBindingType())

                .bindingCost(bindingCost)

                .specialInstructions(
                        request.getSpecialInstructions()
                )

                .estimatedMinutes(
                        estimatedMinutes
                )

                .priorityScore(priorityScore)

                .pageCount(request.getPageCount())

                .totalCost(totalCost)

                .orderCode(orderCode)

                .status(OrderStatus.QUEUED)

                .user(user)

                .shop(shop)

                .paymentCompleted(true)

                .paymentOrderId(
                        request.getPaymentOrderId()
                )

                .build();

        PrintOrder savedOrder = orderRepository.save(order);

        messagingTemplate.convertAndSend(
                "/topic/orders",
                savedOrder
        );

        messagingTemplate.convertAndSend(
                "/topic/shop/" + shop.getId() + "/orders",
                savedOrder
        );

        return savedOrder;
    }

    public List<PrintOrder> getCustomerOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return orderRepository.findByUser(user);
    }

    public List<PrintOrder> getAllOrders() {

        return orderRepository.findAll();
    }

    public List<PrintOrder> getShopOrders(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Shop shop = shopRepository.findByOwner(owner)
                .orElseThrow(() ->
                        new RuntimeException("Shop profile not found"));

        return orderRepository.findByShop(shop);
    }

    public PrintOrder updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request
    ) {

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setStatus(request.getStatus());

        PrintOrder updatedOrder =
                orderRepository.save(order);

        if (updatedOrder.getStatus() == OrderStatus.COMPLETED) {
            updatedOrder =
                    payoutService.initiatePayoutForOrder(updatedOrder);
        }

        messagingTemplate.convertAndSend(
                "/topic/orders",
                updatedOrder
        );

        if (updatedOrder.getShop() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/shop/" + updatedOrder.getShop().getId() + "/orders",
                    updatedOrder
            );
        }

        return updatedOrder;
    }

    public PrintOrder cancelCustomerOrder(
            Long orderId,
            CancelOrderRequest request,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (order.getUser() == null || order.getUser().getId() != user.getId()) {
            throw new RuntimeException("You can cancel only your own orders");
        }

        return cancelAndRefund(order, "CUSTOMER", request == null ? null : request.getReason());
    }

    public PrintOrder cancelShopOrder(
            Long orderId,
            CancelOrderRequest request,
            String ownerEmail
    ) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (order.getShop() == null || order.getShop().getOwner() == null ||
                order.getShop().getOwner().getId() != owner.getId()) {
            throw new RuntimeException("You can cancel only your shop orders");
        }

        return cancelAndRefund(order, "SHOPKEEPER", request == null ? null : request.getReason());
    }

    private PrintOrder cancelAndRefund(
            PrintOrder order,
            String cancelledBy,
            String reason
    ) {

        if (!canCancel(order)) {
            throw new RuntimeException("Order cannot be cancelled after printing has started");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledBy(cancelledBy);
        order.setCancellationReason(reason);

        PrintOrder cancelledOrder =
                orderRepository.save(order);

        initiateRefund(cancelledOrder);

        messagingTemplate.convertAndSend(
                "/topic/orders",
                cancelledOrder
        );

        if (cancelledOrder.getShop() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/shop/" + cancelledOrder.getShop().getId() + "/orders",
                    cancelledOrder
            );
        }

        return orderRepository.findById(cancelledOrder.getId())
                .orElse(cancelledOrder);
    }

    private boolean canCancel(PrintOrder order) {

        return order.getStatus() == OrderStatus.PENDING ||
                order.getStatus() == OrderStatus.PAYMENT_CONFIRMED ||
                order.getStatus() == OrderStatus.QUEUED;
    }

    private void initiateRefund(PrintOrder order) {

        if (order.getPaymentOrderId() == null || order.getPaymentOrderId().isBlank()) {
            order.setRefundStatus("FAILED");
            order.setRefundFailureReason("Payment order id missing");
            orderRepository.save(order);
            return;
        }

        if (order.getRefundStatus() != null && !"FAILED".equalsIgnoreCase(order.getRefundStatus())) {
            return;
        }

        String refundId =
                ("QLD_REFUND_" + order.getId()).replaceAll("[^A-Za-z0-9_]", "_");

        try {
            Map<String, Object> refund =
                    paymentService.createRefund(
                            order.getPaymentOrderId(),
                            order.getTotalCost(),
                            refundId,
                            "Refund for cancelled QloudPrint order " + order.getOrderCode()
                    );

            order.setRefundId(String.valueOf(refund.get("refundId")));
            order.setCfRefundId(String.valueOf(refund.get("cfRefundId")));
            order.setRefundStatus(String.valueOf(refund.get("refundStatus")));
            order.setRefundAmount(Double.valueOf(String.valueOf(refund.get("refundAmount"))));
            order.setRefundFailureReason(null);
        } catch (Exception exception) {
            order.setRefundId(refundId);
            order.setRefundStatus("FAILED");
            order.setRefundAmount(order.getTotalCost());
            order.setRefundFailureReason(exception.getMessage());
        }

        orderRepository.save(order);
    }

    public PrintOrder retryPayout(Long orderId, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (order.getShop() == null || order.getShop().getOwner() == null ||
                order.getShop().getOwner().getId() != owner.getId()) {
            throw new RuntimeException("You can retry payout only for your shop orders");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("Order must be completed before payout");
        }

        return payoutService.initiatePayoutForOrder(order);
    }

    public List<PrintOrder> getOptimizedQueue() {

        return orderRepository
                .findByStatusInOrderByPriorityScoreAsc(activeQueueStatuses())
                .stream()
                .sorted(optimizedQueueComparator())
                .toList();
    }

    private double calculateBindingCost(
            Shop shop,
            String bindingType
    ) {

        if (bindingType == null || "NONE".equalsIgnoreCase(bindingType)) {
            return 0.0;
        }

        return switch (bindingType) {
            case "STAPLE" -> shop.getStaplePrice() == null ? 5.0 : shop.getStaplePrice();
            case "SPIRAL" -> shop.getSpiralBindingPrice() == null ? 30.0 : shop.getSpiralBindingPrice();
            case "STICK_FILE" -> shop.getStickFilePrice() == null ? 15.0 : shop.getStickFilePrice();
            case "HARD_BINDING" -> shop.getHardBindingPrice() == null ? 80.0 : shop.getHardBindingPrice();
            case "SOFT_BINDING" -> shop.getSoftBindingPrice() == null ? 45.0 : shop.getSoftBindingPrice();
            default -> 0.0;
        };
    }

    public List<PrintOrder> getOptimizedQueue(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Shop shop = shopRepository.findByOwner(owner)
                .orElseThrow(() ->
                        new RuntimeException("Shop profile not found"));

        return orderRepository
                .findByShopAndStatusInOrderByPriorityScoreAsc(
                        shop,
                        activeQueueStatuses()
                )
                .stream()
                .sorted(optimizedQueueComparator())
                .toList();
    }

    private Comparator<PrintOrder> optimizedQueueComparator() {

        return Comparator
                .comparing((PrintOrder order) ->
                        order.getEstimatedMinutes() == null ? Integer.MAX_VALUE : order.getEstimatedMinutes()
                )
                .thenComparing(order ->
                        order.getPriorityScore() == null ? Integer.MAX_VALUE : order.getPriorityScore()
                )
                .thenComparing(PrintOrder::getId);
    }

    private List<OrderStatus> activeQueueStatuses() {

        return List.of(
                OrderStatus.PAYMENT_CONFIRMED,
                OrderStatus.QUEUED,
                OrderStatus.PRINTING,
                OrderStatus.READY_FOR_PICKUP
        );
    }

    public OrderEstimateResponse estimateOrder(
            MultipartFile file,
            OrderRequest request
    ) throws IOException {

        PDDocument document =
                Loader.loadPDF(
                        file.getBytes()
                );

        int pageCount =
                document.getNumberOfPages();

        document.close();

        int totalPages =
                pageCount * request.getCopies();

        int estimatedMinutes =
                Math.max(1, totalPages / 10);

        double costPerPage =
                request.getColorPrint()
                        ? 5.0
                        : 2.0;

        double totalCost =
                totalPages * costPerPage;

        return OrderEstimateResponse.builder()
                .pageCount(pageCount)
                .totalPages(totalPages)
                .estimatedMinutes(estimatedMinutes)
                .totalCost(totalCost)
                .build();
    }

    public TempUploadResponse tempUpload(
            MultipartFile file
    ) throws IOException {

        Map uploadResult =
                cloudinary.uploader().upload(

                        file.getBytes(),

                        ObjectUtils.asMap(
                                "resource_type", "raw",
                                "folder", "qloudprint/temp",
                                "use_filename", true,
                                "unique_filename", true,
                                "format", "pdf"
                        )
                );

        String fileUrl =
                uploadResult
                        .get("secure_url")
                        .toString();

        PDDocument document =
                Loader.loadPDF(
                        file.getBytes()
                );

        int pageCount =
                document.getNumberOfPages();

        document.close();

        return TempUploadResponse
                .builder()
                .fileUrl(fileUrl)
                .fileName(
                        file.getOriginalFilename()
                )
                .pageCount(pageCount)
                .build();
    }

    public PrintOrder verifyOrder(
            String orderCode
    ) {

        return orderRepository
                .findByOrderCode(orderCode)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));
    }

    public PrintOrder rateOrder(
            Long orderId,
            RateOrderRequest request,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (order.getUser() == null || order.getUser().getId() != user.getId()) {
            throw new RuntimeException("You can rate only your own orders");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("Order must be completed before rating");
        }

        if (order.getCustomerRating() != null) {
            throw new RuntimeException("This order has already been rated");
        }

        order.setCustomerRating(request.getRating());
        order.setCustomerReview(request.getReview());

        Shop shop =
                order.getShop();

        if (shop != null) {
            int existingCount =
                    shop.getTotalRatings() == null ? 0 : shop.getTotalRatings();

            double existingRating =
                    shop.getRating() == null ? 0.0 : shop.getRating();

            double newRating =
                    ((existingRating * existingCount) + request.getRating()) / (existingCount + 1);

            shop.setRating(Math.round(newRating * 10.0) / 10.0);
            shop.setTotalRatings(existingCount + 1);
            shopRepository.save(shop);
        }

        return orderRepository.save(order);
    }


}
