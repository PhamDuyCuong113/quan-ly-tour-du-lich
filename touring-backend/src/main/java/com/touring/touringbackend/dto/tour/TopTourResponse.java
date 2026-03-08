package com.touring.touringbackend.dto.tour;

public record TopTourResponse(
        String tourName,
        Long totalBookings
) {}
