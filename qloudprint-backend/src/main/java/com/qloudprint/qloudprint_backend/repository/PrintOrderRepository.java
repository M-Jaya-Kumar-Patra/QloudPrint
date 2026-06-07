package com.qloudprint.qloudprint_backend.repository;

import com.qloudprint.qloudprint_backend.entity.OrderStatus;
import com.qloudprint.qloudprint_backend.entity.PrintOrder;
import com.qloudprint.qloudprint_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrintOrderRepository
        extends JpaRepository<PrintOrder, Long> {

    List<PrintOrder> findByUser(User user);
    List<PrintOrder> findByStatus(OrderStatus status);
    List<PrintOrder> findAllByOrderByPriorityScoreAsc();
    Optional<PrintOrder> findByOrderCode(String orderCode);
}