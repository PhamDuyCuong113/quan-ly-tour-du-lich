package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Review;
import com.touring.touringbackend.entity.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Kiểm tra xem một đơn đặt tour đã được đánh giá chưa (để tránh 1 đơn đánh giá 2 lần)
    boolean existsByBookingBookingId(Long bookingId);

    // Lấy tất cả đánh giá của 1 Tour cụ thể (chỉ lấy những cái đang hiện - VISIBLE)
    List<Review> findByTourTourIdAndStatusOrderByCreatedAtDesc(Long tourId, ReviewStatus status);

    // Tính điểm trung bình (trả về Double)
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tour.tourId = :tourId AND r.status = :status")
    Double getAverageRating(@Param("tourId") Long tourId, @Param("status") ReviewStatus status);

    // Đếm tổng số đánh giá
    @Query("SELECT COUNT(r) FROM Review r WHERE r.tour.tourId = :tourId AND r.status = :status")
    Long countReviews(@Param("tourId") Long tourId, @Param("status") ReviewStatus status);
}