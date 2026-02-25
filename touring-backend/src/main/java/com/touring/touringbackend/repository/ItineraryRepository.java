package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    // Tự động xóa lịch trình cũ của một tour nếu cần cập nhật lại toàn bộ
    void deleteByTourTourId(Long tourId);
}