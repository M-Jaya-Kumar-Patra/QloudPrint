package com.qloudprint.qloudprint_backend.dto;

import lombok.Data;

@Data
public class OrderRequest {

    private Integer copies;

    private Boolean colorPrint;

    private String paperSize;

    private String printSide;

    private String bindingType;

    private String specialInstructions;

    private String fileUrl;

    private String fileName;

    private Integer pageCount;

    private String paymentOrderId;

    private Long shopId;
}
