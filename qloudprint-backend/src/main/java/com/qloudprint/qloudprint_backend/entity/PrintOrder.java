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

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")

    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler"
    })

    private User user;

    private Integer estimatedMinutes;

    private Integer priorityScore;

    private Integer pageCount;

    private Double totalCost;

    private String orderCode;

    private Boolean paymentCompleted;

    private String paymentOrderId;
}