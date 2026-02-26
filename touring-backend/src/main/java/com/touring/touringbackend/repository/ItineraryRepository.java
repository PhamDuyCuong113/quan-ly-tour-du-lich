package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    @Modifying // BẮT BUỘC có cái này để chạy lệnh DELETE/UPDATE
    @Transactional // Đảm bảo việc xóa được thực thi ngay
    void deleteByTourTourId(Long tourId);
}