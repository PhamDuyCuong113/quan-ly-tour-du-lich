package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.review.ReviewRequest;
import com.touring.touringbackend.dto.review.ReviewResponse;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 1. Gửi đánh giá (Cần đăng nhập)
    @PostMapping("/reviews")
    public ResponseEntity<String> createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {

        return ResponseEntity.ok(reviewService.postReview(userDetails.getCustomerId(), request));
    }

    // 2. Xem danh sách đánh giá của 1 Tour (Công khai)
    @GetMapping("/tours/{tourId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getTourReviews(@PathVariable Long tourId) {
        return ResponseEntity.ok(reviewService.getReviewsByTour(tourId));
    }
}