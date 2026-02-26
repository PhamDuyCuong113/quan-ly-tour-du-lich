package com.touring.touringbackend.dto.admin;

import com.touring.touringbackend.entity.CustomerType;
import com.touring.touringbackend.entity.LoyaltyLevel;

public record CustomerResponse(
        Long customerId,
        String fullName,
        String email,
        String phone,
        CustomerType customerType,
        Integer totalPoints,
        LoyaltyLevel level
) {}