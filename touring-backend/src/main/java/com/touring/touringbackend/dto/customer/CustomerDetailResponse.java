package com.touring.touringbackend.dto.admin;

import com.touring.touringbackend.dto.booking.BookingResponse;
import java.util.List;

public record CustomerDetailResponse(
        com.touring.touringbackend.dto.admin.CustomerResponse customerInfo,
        List<BookingResponse> bookingHistory,
        java.math.BigDecimal totalSpent
) {}