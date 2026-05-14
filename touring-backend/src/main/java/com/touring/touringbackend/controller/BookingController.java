package com.touring.touringbackend.controller;

import com.touring.touringbackend.audit.Audited;
import com.touring.touringbackend.dto.booking.BookingRequest;
import com.touring.touringbackend.dto.booking.BookingResponse;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // 1. Đặt tour mới
    @PostMapping
    @Audited(action = "CREATE_BOOKING", tableName = "booking", description = "Khách hàng đặt tour")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {

        // Lấy customerId thực từ Token
        Long customerId = userDetails.getCustomerId();
        return ResponseEntity.ok(bookingService.createBooking(request, customerId));
    }

    // 2. Lấy chi tiết 1 booking
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // 3. Lấy danh sách tour "của tôi"
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // Hệ thống tự lọc theo ID người đang đăng nhập
        Long customerId = userDetails.getCustomerId();
        return ResponseEntity.ok(bookingService.getMyBookings(customerId));
    }

    // 4. Hủy tour
    @PatchMapping("/{id}/cancel")
    @Audited(action = "CANCEL_BOOKING", tableName = "booking", description = "Hủy đơn đặt tour")
    public ResponseEntity<BookingResponse> cancelBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        Long customerId = userDetails.getCustomerId();
        return ResponseEntity.ok(bookingService.cancelBooking(id, customerId));
    }
}