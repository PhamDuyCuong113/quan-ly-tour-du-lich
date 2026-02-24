package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.review.ReviewRequest;
import com.touring.touringbackend.dto.review.ReviewResponse;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.BookingRepository;
import com.touring.touringbackend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public String postReview(Long customerId, ReviewRequest request) {
        // 1. Kiểm tra Booking có tồn tại không
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng này"));

        // 2. Kiểm tra quyền: Đây có phải đơn hàng của bạn không?
        if (!booking.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không thể đánh giá đơn hàng của người khác");
        }

        // 3. Kiểm tra trạng thái: Phải hoàn thành thanh toán (CONFIRMED) mới được đánh giá
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sau khi đã hoàn tất chuyến đi");
        }

        // 4. Kiểm tra xem đã đánh giá chưa
        if (reviewRepository.existsByBookingBookingId(request.bookingId())) {
            throw new RuntimeException("Bạn đã gửi đánh giá cho chuyến đi này rồi");
        }

        // 5. Lưu đánh giá
        Review review = new Review();
        review.setBooking(booking);
        review.setCustomer(booking.getCustomer());
        review.setTour(booking.getTourSchedule().getTour()); // Lấy Tour từ Schedule của Booking
        review.setRating(request.rating());
        review.setComment(request.comment());
        review.setStatus(ReviewStatus.VISIBLE);

        reviewRepository.save(review);
        return "Cảm ơn bạn đã gửi đánh giá!";
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByTour(Long tourId) {
        return reviewRepository.findByTourTourIdAndStatusOrderByCreatedAtDesc(tourId, ReviewStatus.VISIBLE)
                .stream()
                .map(r -> new ReviewResponse(
                        r.getReviewId(),
                        r.getCustomer().getFullName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                )).toList();
    }
}