package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.tour.*;
import com.touring.touringbackend.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourResponse>> getAllTours() {
        return ResponseEntity.ok(tourService.getAllAvailableTours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDetailResponse> getTourDetail(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourDetail(id));
    }

    @PostMapping
    public ResponseEntity<TourResponse> createTour(@Valid @RequestBody TourCreateRequest request) {
        return ResponseEntity.ok(tourService.createTour(request));
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<String> addSchedule(@PathVariable Long id, @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(tourService.createSchedule(id, request));
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

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadImage(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok("Upload thành công! Xem ảnh tại: " + tourService.uploadTourImage(id, file));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<TourResponse>> getRelated(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getRelatedTours(id));
    }

    // GỘP LẠI THÀNH 1 HÀM DUY NHẤT ĐỂ HẾT LỖI AMBIGUOUS
    @PostMapping("/{id}/itineraries")
    public ResponseEntity<String> updateItineraries(@PathVariable Long id, @RequestBody List<ItineraryRequest> requests) {
        tourService.updateItineraries(id, requests);
        return ResponseEntity.ok("Cập nhật lịch trình thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourResponse> updateTour(@PathVariable Long id, @RequestBody TourCreateRequest request) {
        return ResponseEntity.ok(tourService.updateTour(id, request));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable Long imageId) {
        tourService.deleteTourImage(imageId);
        return ResponseEntity.ok("Đã xóa ảnh thành công");
    }
}