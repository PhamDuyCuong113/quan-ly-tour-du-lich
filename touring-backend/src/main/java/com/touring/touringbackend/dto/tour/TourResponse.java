package com.touring.touringbackend.dto.tour;

import java.math.BigDecimal;

public record TourResponse(
        Long tourId,
        String tourCode,
        String tourName,
        String destination,
        BigDecimal basePrice,
        Integer durationDays,
        String imageUrl,
        Double averageRating,
        Long totalReviews,
        String staffName
) {}