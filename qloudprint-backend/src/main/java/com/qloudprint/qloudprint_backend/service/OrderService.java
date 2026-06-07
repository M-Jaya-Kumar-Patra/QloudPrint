package com.qloudprint.qloudprint_backend.service;

import com.qloudprint.qloudprint_backend.dto.OrderEstimateResponse;
import com.qloudprint.qloudprint_backend.dto.OrderRequest;
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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PrintOrderRepository orderRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final Cloudinary cloudinary;

    public PrintOrder createOrder(
            OrderRequest request,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        int totalPages =
                request.getPageCount()
                        * request.getCopies();

        int estimatedMinutes =
                Math.max(1, totalPages / 10);

        double costPerPage =
                request.getColorPrint()
                        ? 5.0
                        : 2.0;

        double totalCost =
                totalPages * costPerPage;

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

                .estimatedMinutes(
                        estimatedMinutes
                )

                .priorityScore(priorityScore)

                .pageCount(request.getPageCount())

                .totalCost(totalCost)

                .orderCode(orderCode)

                .status(OrderStatus.QUEUED)

                .user(user)

                .paymentCompleted(true)

                .paymentOrderId(
                        request.getPaymentOrderId()
                )

                .build();

        return orderRepository.save(order);
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

        messagingTemplate.convertAndSend(
                "/topic/orders",
                updatedOrder
        );

        return updatedOrder;
    }

    public List<PrintOrder> getOptimizedQueue() {

        return orderRepository
                .findAllByOrderByPriorityScoreAsc();
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


}