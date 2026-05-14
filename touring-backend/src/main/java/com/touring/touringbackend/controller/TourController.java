package com.touring.touringbackend.controller;

import com.touring.touringbackend.audit.Audited;
import com.touring.touringbackend.dto.tour.*;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    /* ==========================================================
       1. PUBLIC APIs (Cho Khách hàng & Người dùng vãng lai)
       ========================================================== */

    @GetMapping
    public ResponseEntity<List<TourResponse>> getAllTours() {
        return ResponseEntity.ok(tourService.getAllAvailableTours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDetailResponse> getTourDetail(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourDetail(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(tourService.searchTours(keyword, minPrice, maxPrice, startDate, endDate, sortBy));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<TourResponse>> getRelated(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getRelatedTours(id));
    }

    /* ==========================================================
       2. MANAGEMENT APIs (Cho ADMIN & STAFF - Có check quyền sở hữu)
       ========================================================== */

    /**
     * Lấy danh sách tour dành cho trang quản lý (Lọc theo Staff/Admin)
     */
    @GetMapping("/management/search")
    public ResponseEntity<List<TourResponse>> searchToursForManagement(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String sortBy,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(tourService.searchToursForManagement(
                keyword, minPrice, maxPrice, startDate, endDate, sortBy, currentUser
        ));
    }

    /**
     * Tạo Tour mới (Tự động gán người tạo làm chủ)
     */
    @PostMapping
    @Audited(action = "CREATE_TOUR", tableName = "tour", description = "Tạo tour mới")
    public ResponseEntity<TourResponse> createTour(
            @Valid @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(tourService.createTour(request, currentUser));
    }

    /**
     * Cập nhật thông tin Tour
     */
    @PutMapping("/{id}")
    @Audited(action = "UPDATE_TOUR", tableName = "tour", description = "Cập nhật thông tin tour")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long id,
            @Valid @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(tourService.updateTour(id, request, currentUser));
    }

    /**
     * Xóa tour (Xóa mềm)
     */
    @DeleteMapping("/{id}")
    @Audited(action = "DELETE_TOUR", tableName = "tour", description = "Xoá tour")
    public ResponseEntity<String> deleteTour(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        tourService.deleteTour(id, currentUser);
        return ResponseEntity.ok("Xóa tour thành công!");
    }

    /**
     * Upload ảnh (Chỉ chủ tour mới được upload)
     */
    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadImages(
            @PathVariable Long id,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<MultipartFile> uploads = new ArrayList<>();
        if (files != null) {
            for (MultipartFile f : files) {
                if (f != null && !f.isEmpty()) uploads.add(f);
            }
        }
        if (file != null && !file.isEmpty()) {
            uploads.add(file);
        }
        if (uploads.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Không có file để upload");
        }

        MultipartFile[] uploadArray = uploads.toArray(new MultipartFile[0]);
        tourService.uploadTourImages(id, uploadArray, currentUser);
        return ResponseEntity.ok("Đã tải lên thành công " + uploadArray.length + " ảnh.");
    }

    /**
     * Xóa ảnh tour
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<String> deleteImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        tourService.deleteTourImage(imageId, currentUser);
        return ResponseEntity.ok("Đã xóa ảnh thành công");
    }

    /**
     * Quản lý lịch trình chi tiết (Ngày 1, Ngày 2...)
     */
    @PostMapping("/{id}/itineraries")
    public ResponseEntity<String> updateItineraries(
            @PathVariable Long id,
            @RequestBody List<ItineraryRequest> requests,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        tourService.updateItineraries(id, requests, currentUser);
        return ResponseEntity.ok("Cập nhật hành trình thành công");
    }

    /**
     * Upload ảnh cho 1 ngày trong lịch trình
     */
    @PostMapping("/itineraries/upload-image")
    public ResponseEntity<java.util.Map<String, String>> uploadItineraryImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Không có file để upload");
        }
        return ResponseEntity.ok(tourService.uploadItineraryImage(file));
    }

    /**
     * Mở thêm ngày khởi hành mới
     */
    @PostMapping("/{id}/schedules")
    public ResponseEntity<String> addSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(tourService.createSchedule(id, request, currentUser));
    }

    /**
     * Cập nhật ngày khởi hành
     */
    @PutMapping("/schedules/{scheduleId}")
    public ResponseEntity<String> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody ScheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        tourService.updateSchedule(scheduleId, request, currentUser);
        return ResponseEntity.ok("Cập nhật lịch trình thành công");
    }

    /**
     * Xóa ngày khởi hành
     */
    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<String> deleteSchedule(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        tourService.deleteSchedule(scheduleId, currentUser);
        return ResponseEntity.ok("Xóa lịch trình thành công");
    }
}