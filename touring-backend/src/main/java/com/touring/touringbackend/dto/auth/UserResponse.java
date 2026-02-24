package com.touring.touringbackend.dto.auth;

import com.touring.touringbackend.entity.LoyaltyLevel;

public record UserResponse(
        Long accountId,
        String username,
        String fullName,
        String email,
        String phone,
        String role,
        String customerType,
        Integer totalPoints,
        LoyaltyLevel level // Trả về Enum trực tiếp
) {}