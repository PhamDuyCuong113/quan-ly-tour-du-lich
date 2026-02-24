package com.touring.touringbackend.dto.tour;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TourDetailResponse(
        Long tourId,
        String tourName,
        String description,
        BigDecimal basePrice,
        List<ScheduleDTO> schedules // Danh sách các ngày khởi hành
) {
    public record ScheduleDTO(
            Long scheduleId,
            LocalDate departureDate,
            LocalDate returnDate,
            Integer availableSlots,
            BigDecimal price
    ) {}
}