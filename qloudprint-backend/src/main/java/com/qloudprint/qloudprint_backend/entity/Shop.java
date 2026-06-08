package com.qloudprint.qloudprint_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String phone;

    private Double latitude;

    private Double longitude;

    private String openingTime;

    private String closingTime;

    private Boolean openNow;

    private Boolean verified;

    private Boolean colorPrinting;

    private Boolean binding;

    private Boolean lamination;

    private Boolean stapling;

    private Boolean spiralBinding;

    private Boolean stickFile;

    private Boolean hardBinding;

    private Boolean softBinding;

    private Double bwPricePerPage;

    private Double colorPricePerPage;

    private Double duplexPricePerPage;

    private Double staplePrice;

    private Double spiralBindingPrice;

    private Double stickFilePrice;

    private Double hardBindingPrice;

    private Double softBindingPrice;

    private Double rating;

    private Integer totalRatings;

    private Integer averagePagesPerMinute;

    private Integer printSecondsPerPage;

    private String planName;

    private String shopPhotoUrl;

    private String staplePhotoUrl;

    private String spiralBindingPhotoUrl;

    private String stickFilePhotoUrl;

    private String hardBindingPhotoUrl;

    private String softBindingPhotoUrl;

    private String bankAccountHolder;

    private String bankAccountNumber;

    private String bankIfsc;

    private String upiId;

    private String gstNumber;

    private String cashfreeBeneficiaryId;

    private String cashfreeBeneficiaryStatus;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties({
            "password",
            "hibernateLazyInitializer",
            "handler"
    })
    private User owner;
}
