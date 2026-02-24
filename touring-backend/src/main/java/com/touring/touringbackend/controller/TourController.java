package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.tour.*;
import com.touring.touringbackend.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    /**
     * 1. Lấy danh sách Tour đang mở (Dành cho mọi người)
     */
    @GetMapping
    public ResponseEntity<List<TourResponse>> getAllTours() {
        return ResponseEntity.ok(tourService.getAllAvailableTours());
    }

    /**
     * 2. Lấy thông tin chi tiết Tour và các lịch khởi hành (Dành cho mọi người)
     */
    @GetMapping("/{id}")
    public ResponseEntity<TourDetailResponse> getTourDetail(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourDetail(id));
    }

    /**
     * 3. Tạo Tour mới (Chỉ dành cho ADMIN)
     */
    @PostMapping
    public ResponseEntity<TourResponse> createTour(@Valid @RequestBody TourCreateRequest request) {
        return ResponseEntity.ok(tourService.createTour(request));
    }

    /**
     * 4. Thêm lịch khởi hành cho Tour (Chỉ dành cho ADMIN)
     * Đường dẫn: POST /api/tours/{id}/schedules
     */
    @PostMapping("/{id}/schedules")
    public ResponseEntity<String> addSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {

        String result = tourService.createSchedule(id, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourResponse>> searchTours(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        return ResponseEntity.ok(tourService.searchTours(destination, minPrice, maxPrice));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadImage(
            @PathVariable Long id,
            @RequestPart("file") org.springframework.web.multipart.MultipartFile file) {

        String url = tourService.uploadTourImage(id, file);
        return ResponseEntity.ok("Upload thành công! Xem ảnh tại: " + url);
    }
}