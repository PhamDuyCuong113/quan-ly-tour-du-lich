package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Promotion;
import com.touring.touringbackend.entity.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    // Tìm mã còn hiệu lực để khách dùng
    Optional<Promotion> findByCodeAndStatus(String code, PromotionStatus status);
}