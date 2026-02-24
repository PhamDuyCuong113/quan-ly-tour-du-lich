package com.touring.touringbackend.dto.booking;


import com.touring.touringbackend.dto.passenger.PassengerResponse;
import com.touring.touringbackend.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(
        Long bookingId,
        String tourName,         // Trả về tên tour thay vì ID
        String customerName,     // Trả về tên khách hàng
        Integer numberOfPeople,
        BigDecimal totalPrice,
        BookingStatus status,
        LocalDateTime bookingDate

) {}