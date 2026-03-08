package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.admin.AdminStatsResponse;
import com.touring.touringbackend.dto.admin.CustomerResponse;
import com.touring.touringbackend.dto.admin.StaffResponse;
import com.touring.touringbackend.dto.auth.RegisterRequest;
import com.touring.touringbackend.dto.booking.BookingRequest;
import com.touring.touringbackend.dto.booking.BookingResponse;
import com.touring.touringbackend.dto.passenger.PassengerResponse;
import com.touring.touringbackend.entity.BookingStatus;
import com.touring.touringbackend.entity.Customer;
import com.touring.touringbackend.entity.Staff;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.AdminService;
import com.touring.touringbackend.service.BookingService;
import com.touring.touringbackend.service.ExcelExportService; // THÊM IMPORT NÀY
import com.touring.touringbackend.service.PassengerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ExcelExportService excelExportService; // KHAI BÁO THÊM Ở ĐÂY
    private final PassengerService passengerService;
    /**
     * API Thống kê tổng quan (Doanh thu, số đơn, số khách)
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(adminService.getStats(user));
    }

    /**
     * API Xuất danh sách hành khách ra file Excel
     * Link: GET /api/admin/tours/schedules/{scheduleId}/export
     */
    @GetMapping("/tours/schedules/{scheduleId}/export")
    public ResponseEntity<byte[]> exportPassengers(@PathVariable Long scheduleId) throws IOException {
        // Gọi service tạo file Excel dạng byte array
        byte[] excelContent = excelExportService.exportPassengersToExcel(scheduleId);

        // Trả về file để trình duyệt tự động tải xuống
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=passengers_schedule_" + scheduleId + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelContent);
    }

    // Trong AdminController.java

    @GetMapping("/schedules/{scheduleId}/passengers")
    public ResponseEntity<List<PassengerResponse>> getManifest(@PathVariable Long scheduleId) {
        // Trả về danh sách toàn bộ đoàn đi cùng lịch trình này
        return ResponseEntity.ok(passengerService.getAllPassengersInSchedule(scheduleId));
    }

    @GetMapping("/staffs")
    public ResponseEntity<List<StaffResponse>> getStaffs() {
        return ResponseEntity.ok(adminService.getAllStaffs());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponse>> getCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }

    @PostMapping("/staffs")
    public ResponseEntity<String> createStaff(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(adminService.createStaffAccount(req));
    }

    @PatchMapping("/staffs/{id}/toggle")
    public ResponseEntity<String> toggleStaff(@PathVariable Long id) {
        adminService.toggleStaffStatus(id);
        return ResponseEntity.ok("Cập nhật trạng thái thành công");
    }

    @PatchMapping("/customers/{id}/toggle")
    public ResponseEntity<String> toggleCustomer(@PathVariable Long id) {
        adminService.toggleCustomerStatus(id);
        return ResponseEntity.ok("Cập nhật trạng thái khách hàng thành công");
    }

    // Trong AdminController.java
    @GetMapping("/my-customers")
    public ResponseEntity<List<CustomerResponse>> getMyCustomers(@AuthenticationPrincipal CustomUserDetails user) {
        // Nếu là Admin thì lấy hết, nếu là Staff thì chỉ lấy khách của mình
        if (user.getRole().equals("ADMIN")) {
            return ResponseEntity.ok(adminService.getAllCustomers());
        }
        return ResponseEntity.ok(adminService.getCustomersByStaff(user.getStaffId()));
    }
    @GetMapping("/customers/{id}")
    public ResponseEntity<?> getCustomerDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(adminService.getCustomerDetail(id, user));
    }

}