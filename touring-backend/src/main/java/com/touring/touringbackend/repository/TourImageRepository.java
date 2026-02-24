package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TourImageRepository extends JpaRepository<TourImage, Long> {
}