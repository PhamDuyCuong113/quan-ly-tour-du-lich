package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Tour;
import com.touring.touringbackend.entity.TourStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long> {



    // Kiểm tra trùng mã Tour (Dùng cho lúc Admin tạo Tour)
    boolean existsByTourCode(String tourCode);

    // Lấy danh sách Tour theo trạng thái (Dùng cho khách xem Tour OPEN)
    List<Tour> findByStatusAndIsDeletedFalse(TourStatus status);

    // Lấy chi tiết Tour kèm theo Lịch trình (Schedules) và Ảnh (Images)
    // Dùng @EntityGraph để tránh lỗi Lazy Loading và tối ưu số câu lệnh SELECT
    @EntityGraph(attributePaths = {"schedules", "images"})
    Optional<Tour> findById(Long id);

    List<Tour> findByDestinationContainingIgnoreCaseAndBasePriceBetweenAndStatus(
            String destination,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            TourStatus status
    );
}