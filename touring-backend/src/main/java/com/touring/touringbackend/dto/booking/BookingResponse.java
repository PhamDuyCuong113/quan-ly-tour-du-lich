package com.touring.touringbackend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
        Long bookingId,
        String tourName,
        String customerName,
        Integer numberOfPeople,
        BigDecimal totalPrice,
        String status, // Đổi từ BookingStatus sang String để đồng bộ
        LocalDateTime bookingDate
) {}