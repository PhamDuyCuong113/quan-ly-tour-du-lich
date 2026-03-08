package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.booking.BookingRequest;
import com.touring.touringbackend.dto.booking.BookingResponse;
import com.touring.touringbackend.entity.BookingStatus;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    // 1. Staff tạo đơn tại quầy cho khách (Dùng customerId từ dropdown)
    @PostMapping("/manual")
    public ResponseEntity<BookingResponse> createManual(
            @RequestBody BookingRequest request,
            @RequestParam Long customerId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(bookingService.createManualBooking(request, currentUser.getStaffId(), customerId));
    }

    // 2. Admin/Staff cập nhật trạng thái đơn (Ví dụ: Chuyển sang PAID khi nhận tiền mặt)
    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }
}