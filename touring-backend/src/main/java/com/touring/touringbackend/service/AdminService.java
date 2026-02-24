package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.admin.AdminStatsResponse;
import com.touring.touringbackend.repository.BookingRepository;
import com.touring.touringbackend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;

    public AdminStatsResponse getStats() {
        BigDecimal revenue = bookingRepository.getTotalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        Long bookings = bookingRepository.countSuccessfulBookings();
        Long customers = customerRepository.count();

        return new AdminStatsResponse(revenue, bookings, customers);
    }
}