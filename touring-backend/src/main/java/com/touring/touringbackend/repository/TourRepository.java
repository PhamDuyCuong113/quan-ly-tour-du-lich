package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Tour;
import com.touring.touringbackend.entity.TourStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    @EntityGraph(attributePaths = {"schedules", "images", "itineraries"})
    Optional<Tour> findById(Long id);

    List<Tour> findByDestinationContainingIgnoreCaseAndBasePriceBetweenAndStatus(
            String destination,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            TourStatus status
    );

    List<Tour> findTop4ByDestinationContainingIgnoreCaseAndTourIdNotAndStatus(
            String destination, Long tourId, TourStatus status);


    @Query("SELECT DISTINCT t FROM Tour t LEFT JOIN t.schedules s " +
            "WHERE (:keyword IS NULL OR " + // Nếu keyword có giá trị thì mới lọc
            "      LOWER(t.destination) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // Tìm trong điểm đến
            "      LOWER(t.tourName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +    // Tìm trong tên tour
            "AND (:minPrice IS NULL OR t.basePrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice) " +
            "AND (:startDate IS NULL OR s.departureDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.departureDate <= :endDate) " +
            "AND t.isDeleted = false")
    List<Tour> advancedSearch(
            @Param("keyword") String keyword, // Đổi tên từ destination sang keyword cho đúng ý nghĩa
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate
    );
}