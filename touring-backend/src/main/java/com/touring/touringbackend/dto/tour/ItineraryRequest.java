package com.touring.touringbackend.dto.tour;

public record ItineraryRequest(
        Integer dayNumber,
        String title,
        String description,
        String imageUrl,
        String imagePublicId
) {}