package com.qloudprint.qloudprint_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "orders")
@JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private String fileUrl;

    private Integer copies;

    private Boolean colorPrint;

    private String paperSize;

    private String printSide;

    private String bindingType;

    private Double bindingCost;

    @Column(length = 1000)
    private String specialInstructions;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })

    private User user;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })
    private Shop shop;

    private Integer estimatedMinutes;

    private Integer priorityScore;

    private Integer pageCount;

    private Double totalCost;

    private String orderCode;

    private Boolean paymentCompleted;

    private String paymentOrderId;

    private Integer customerRating;

    @Column(length = 600)
    private String customerReview;

    private Double platformFee;

    private Double shopPayoutAmount;

    private String payoutStatus;

    private String payoutTransferId;

    private String payoutCfTransferId;

    @Column(length = 1000)
    private String payoutFailureReason;

    private String cancelledBy;

    @Column(length = 800)
    private String cancellationReason;

    private String refundStatus;

    private String refundId;

    private String cfRefundId;

    private Double refundAmount;

    @Column(length = 1000)
    private String refundFailureReason;
}
