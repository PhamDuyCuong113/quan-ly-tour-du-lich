package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Tour;
import com.touring.touringbackend.entity.TourStatus;
import com.touring.touringbackend.entity.TourType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long> {

    // Kiểm tra trùng mã Tour
    boolean existsByTourCode(String tourCode);

    // Lấy danh sách Tour công khai cho khách
    List<Tour> findByStatusAndIsDeletedFalse(TourStatus status);

    // Lấy chi tiết Tour (Nạp luôn các bảng liên quan để tránh lỗi 0.0 rating hoặc rỗng lịch trình)
    @EntityGraph(attributePaths = {"schedules", "images", "itineraries", "staff"})
    Optional<Tour> findById(Long id);

    // Tìm top 4 tour liên quan
    List<Tour> findTop4ByDestinationContainingIgnoreCaseAndTourIdNotAndStatus(
            String destination, Long tourId, TourStatus status);

    /**
     * HÀM TÌM KIẾM NÂNG CAO (Dùng cho cả Khách, Staff và Admin)
     */
    @Query("SELECT DISTINCT t FROM Tour t LEFT JOIN t.schedules s " +
            "WHERE (:keyword IS NULL OR " +
            "      LOWER(t.destination) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "      LOWER(t.tourName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:minPrice IS NULL OR t.basePrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice) " +
            "AND (:startDate IS NULL OR s.departureDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.departureDate <= :endDate) " +
            "AND (:tourType IS NULL OR t.tourType = :tourType) " +
            "AND (:destinationId IS NULL OR EXISTS (" +
            "      SELECT 1 FROM Destination d " +
            "      WHERE d.destinationId = :destinationId " +
            "      AND LOWER(d.name) = LOWER(t.destination))) " +
            "AND (:staffId IS NULL OR t.staff.id = :staffId) " + // CHỐT CHẶN: Lọc theo chủ sở hữu
            "AND t.isDeleted = false")
    List<Tour> advancedSearch(
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("tourType") TourType tourType,
            @Param("destinationId") Long destinationId,
            @Param("staffId") Long staffId // Nếu truyền null -> Admin (xem hết), nếu có ID -> Staff (xem của mình)
    );

    @Query("SELECT DISTINCT t FROM Tour t LEFT JOIN t.schedules s " +
            "WHERE (:keyword IS NULL OR " +
            "      LOWER(t.destination) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "      LOWER(t.tourName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:minPrice IS NULL OR t.basePrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice) " +
            "AND (:startDate IS NULL OR s.departureDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.departureDate <= :endDate) " +
            "AND (:tourType IS NULL OR t.tourType = :tourType) " +
            "AND (:destinationId IS NULL OR EXISTS (" +
            "      SELECT 1 FROM Destination d " +
            "      WHERE d.destinationId = :destinationId " +
            "      AND LOWER(d.name) = LOWER(t.destination))) " +
            "AND (:staffId IS NULL OR t.staff.id = :staffId) " +
            "AND (:includeDeleted = true OR t.isDeleted = false)")
    List<Tour> advancedSearchForManagement(
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("tourType") TourType tourType,
            @Param("destinationId") Long destinationId,
            @Param("staffId") Long staffId,
            @Param("includeDeleted") boolean includeDeleted
    );
}