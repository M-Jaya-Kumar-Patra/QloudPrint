package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.dto.OrderEstimateResponse;
import com.qloudprint.qloudprint_backend.dto.OrderRequest;
import com.qloudprint.qloudprint_backend.dto.TempUploadResponse;
import com.qloudprint.qloudprint_backend.entity.PrintOrder;
import com.qloudprint.qloudprint_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public PrintOrder createOrder(
            @RequestBody OrderRequest request,
            Authentication authentication
    ) throws IOException {

        return orderService.createOrder(
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<PrintOrder> getCustomerOrders(
            Authentication authentication
    ) {

        return orderService.getCustomerOrders(
                authentication.getName()
        );
    }

    @PostMapping("/estimate")
    public OrderEstimateResponse estimateOrder(
            @RequestParam("file")
            MultipartFile file,

            @RequestParam Integer copies,

            @RequestParam Boolean colorPrint,

            @RequestParam String paperSize
    ) throws IOException {

        OrderRequest request =
                new OrderRequest();

        request.setCopies(copies);

        request.setColorPrint(colorPrint);

        request.setPaperSize(paperSize);

        return orderService.estimateOrder(
                file,
                request
        );
    }

    @PostMapping("/temp-upload")
    public TempUploadResponse tempUpload(
            @RequestParam("file")
            MultipartFile file
    ) throws IOException {

        return orderService
                .tempUpload(file);
    }
}