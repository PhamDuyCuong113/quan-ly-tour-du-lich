package com.touring.touringbackend.dto.admin;

import java.math.BigDecimal;

public record AdminStatsResponse(
        BigDecimal totalRevenue,
        Long totalBookings,
        Long totalCustomers
) {}
