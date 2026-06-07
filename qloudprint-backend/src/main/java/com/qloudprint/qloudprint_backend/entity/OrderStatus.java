package com.qloudprint.qloudprint_backend.entity;

public enum OrderStatus {

    PENDING,

    PAYMENT_CONFIRMED,

    QUEUED,

    PRINTING,

    READY_FOR_PICKUP,

    COMPLETED,

    CANCELLED
}