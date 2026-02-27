package com.touring.touringbackend.dto.admin;

public record StaffResponse(
        Long staffId,
        String fullName,
        String email,
        String phone,
        String username, // Lấy từ Account
        String status
) {}