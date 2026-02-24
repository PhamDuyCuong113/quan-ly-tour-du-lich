package com.touring.touringbackend.dto.review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long reviewId,
        String customerName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {}