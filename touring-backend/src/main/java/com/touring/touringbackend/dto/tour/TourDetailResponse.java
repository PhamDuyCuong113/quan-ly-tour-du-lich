package com.touring.touringbackend.dto.tour;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TourDetailResponse(
        Long tourId,
        String tourCode,
        String tourName,
        String description,
        String destination,
        BigDecimal basePrice,
        String tourType,
        Double averageRating,
        Long totalReviews,
        String accommodation,
        String departureFrom,
        String transport,
        Boolean isFeatured,
        String highlights,
        String inclusions,
        String exclusions,
        String terms,
        List<ImageDTO> images,
        List<ScheduleDTO> schedules,
        List<ItineraryDTO> itineraries
) {
    public record ImageDTO(
            Long imageId,
            String imageUrl,
            String publicId,
            String caption
    ) {}
    public record ScheduleDTO(
            Long scheduleId,
            LocalDate departureDate,
            LocalDate returnDate,
            Integer maxSlots,
            Integer availableSlots,
            BigDecimal price
    ) {}
    public record ItineraryDTO(
            Long itineraryId,
            Integer dayNumber,
            String title,
            String description,
            String imageUrl
    ) {}
}