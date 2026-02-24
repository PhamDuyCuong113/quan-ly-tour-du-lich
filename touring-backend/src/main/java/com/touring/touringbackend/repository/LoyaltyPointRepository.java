package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.LoyaltyPoint;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, Long> {
}