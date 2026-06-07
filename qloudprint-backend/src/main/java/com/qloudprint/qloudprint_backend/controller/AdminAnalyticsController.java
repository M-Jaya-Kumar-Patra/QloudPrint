package com.qloudprint.qloudprint_backend.controller;

import com.qloudprint.qloudprint_backend.entity.OrderStatus;
import com.qloudprint.qloudprint_backend.entity.Role;
import com.qloudprint.qloudprint_backend.entity.PrintOrder;
import com.qloudprint.qloudprint_backend.repository.PrintOrderRepository;
import com.qloudprint.qloudprint_backend.repository.ShopRepository;
import com.qloudprint.qloudprint_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @GetMapping
    public Map<String, Object> analytics() {

        var orders = orderRepository.findAll();

        double revenue = orders.stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(order -> order.getTotalCost() == null ? 0 : order.getTotalCost())
                .sum();

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
        response.put("statusCounts", statusCounts);
        response.put("averageOrderValue", orders.isEmpty() ? 0 : revenue / orders.size());

        return response;
    }
}
