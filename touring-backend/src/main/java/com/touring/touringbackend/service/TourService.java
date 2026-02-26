package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.tour.*;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // SỬA LẠI IMPORT NÀY
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final ReviewRepository reviewRepository;
    private final TourImageRepository tourImageRepository;

    @Value("${upload.path}")
    private String uploadPath;

    /* ==========================================================
       1. DÀNH CHO KHÁCH HÀNG (CUSTOMER)
       ========================================================== */

    @Transactional(readOnly = true)
    public List<TourResponse> getAllAvailableTours() {
        return tourRepository.findByStatusAndIsDeletedFalse(TourStatus.OPEN).stream()
                .map(this::mapToTourResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TourDetailResponse getTourDetail(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour với ID: " + tourId));

        List<TourDetailResponse.ScheduleDTO> scheduleDTOs = tour.getSchedules().stream()
                .filter(s -> s.getStatus() == TourScheduleStatus.OPEN)
                .map(s -> new TourDetailResponse.ScheduleDTO(
                        s.getScheduleId(),
                        s.getDepartureDate(),
                        s.getReturnDate(),
                        s.getAvailableSlots(),
                        s.getPrice()
                )).toList();

        return new TourDetailResponse(
                tour.getTourId(),
                tour.getTourName(),
                tour.getDescription(),
                tour.getBasePrice(),
                scheduleDTOs
        );
    }

    @Transactional(readOnly = true)
    public List<TourResponse> searchTours(String destination, BigDecimal minPrice, BigDecimal maxPrice) {
        String searchDest = (destination == null) ? "" : destination;
        BigDecimal searchMin = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal searchMax = (maxPrice == null) ? new BigDecimal("999999999") : maxPrice;

        return tourRepository.findByDestinationContainingIgnoreCaseAndBasePriceBetweenAndStatus(
                        searchDest, searchMin, searchMax, TourStatus.OPEN)
                .stream()
                .map(this::mapToTourResponse)
                .toList();
    }

    /* ==========================================================
       2. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
       ========================================================== */

    @Transactional
    public TourResponse createTour(TourCreateRequest request) {
        if (tourRepository.existsByTourCode(request.tourCode())) {
            throw new RuntimeException("Mã Tour '" + request.tourCode() + "' đã tồn tại!");
        }

        Tour tour = new Tour();
        tour.setTourCode(request.tourCode());
        tour.setTourName(request.tourName());
        tour.setDestination(request.destination());
        tour.setTourType(request.tourType());
        tour.setDurationDays(request.durationDays());
        tour.setBasePrice(request.basePrice());
        tour.setDescription(request.description());
        tour.setStatus(TourStatus.OPEN);

        Tour saved = tourRepository.save(tour);
        return mapToTourResponse(saved);
    }

    @Transactional
    public String createSchedule(Long tourId, ScheduleRequest request) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour ID: " + tourId));

        if (request.returnDate().isBefore(request.departureDate())) {
            throw new RuntimeException("Lỗi: Ngày về phải sau ngày khởi hành!");
        }

        TourSchedule schedule = new TourSchedule();
        schedule.setTour(tour);
        schedule.setDepartureDate(request.departureDate());
        schedule.setReturnDate(request.returnDate());
        schedule.setMaxSlots(request.maxSlots());
        schedule.setAvailableSlots(request.maxSlots());
        schedule.setPrice(request.price());
        schedule.setStatus(TourScheduleStatus.OPEN);

        tourScheduleRepository.save(schedule);
        return "Thêm lịch khởi hành thành công cho tour: " + tour.getTourName();
    }

    /**
     * Upload ảnh và lưu vào ổ cứng Laptop + Lưu URL vào Database
     */
    @Transactional
    public String uploadTourImage(Long tourId, MultipartFile file) {
        try {
            // 1. Kiểm tra Tour tồn tại
            Tour tour = tourRepository.findById(tourId)
                    .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));

            // 2. Tạo thư mục nếu chưa có
            File directory = new File(uploadPath);
            if (!directory.exists()) directory.mkdirs();

            // 3. Đổi tên file để tránh trùng (Dùng timestamp)
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadPath, fileName);

            // 4. Lưu file vật lý vào ổ cứng
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 5. Tạo URL để xem trên Web
            String fileUrl = "http://localhost:8080/uploads/" + fileName;

            // 6. Lưu vào bảng tour_image trong DB
            TourImage tourImage = new TourImage();
            tourImage.setTour(tour);
            tourImage.setImageUrl(fileUrl);
            tourImageRepository.save(tourImage);

            return fileUrl;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file: " + e.getMessage());
        }
    }

    /* ==========================================================
       3. HÀM HỖ TRỢ (HELPER METHODS)
       ========================================================== */

    private TourResponse mapToTourResponse(Tour t) {
        Double avgRating = reviewRepository.getAverageRating(t.getTourId(), ReviewStatus.VISIBLE);
        Long totalReviews = reviewRepository.countReviews(t.getTourId(), ReviewStatus.VISIBLE);

        if (avgRating == null) avgRating = 0.0;
        if (totalReviews == null) totalReviews = 0L;
        avgRating = Math.round(avgRating * 10.0) / 10.0;

        String firstImageUrl = (t.getImages() != null && !t.getImages().isEmpty())
                ? t.getImages().get(0).getImageUrl()
                : null;

        return new TourResponse(
                t.getTourId(), t.getTourCode(), t.getTourName(), t.getDestination(),
                t.getBasePrice(), t.getDurationDays(), firstImageUrl,
                avgRating, totalReviews
        );
    }

    public List<TourResponse> getRelatedTours(Long tourId) {
        Tour currentTour = tourRepository.findById(tourId).orElseThrow();
        return tourRepository.findTop4ByDestinationContainingIgnoreCaseAndTourIdNotAndStatus(
                        currentTour.getDestination(), tourId, TourStatus.OPEN)
                .stream()
                .map(this::mapToTourResponse)
                .toList();
    }


    private final ItineraryRepository itineraryRepository;

    @Transactional
    public String addItinerary(Long tourId, List<ItineraryRequest> requests) {
        // 1. Tìm Tour
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour ID: " + tourId));

        // 2. (Tùy chọn) Xóa lịch trình cũ của Tour này để cập nhật lại từ đầu
        itineraryRepository.deleteByTourTourId(tourId);

        // 3. Chuyển đổi DTO sang Entity và lưu
        List<Itinerary> itineraries = requests.stream().map(req -> {
            Itinerary item = new Itinerary();
            item.setTour(tour);
            item.setDayNumber(req.dayNumber());
            item.setTitle(req.title());
            item.setDescription(req.description());
            return item;
        }).toList();

        itineraryRepository.saveAll(itineraries);
        return "Đã cập nhật lịch trình cho tour: " + tour.getTourName();
    }



    /**
     * 1. Cập nhật thông tin cơ bản của Tour
     */
    @Transactional
    public TourResponse updateTour(Long id, TourCreateRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour ID: " + id));

        tour.setTourName(request.tourName());
        tour.setDestination(request.destination());
        tour.setBasePrice(request.basePrice());
        tour.setDurationDays(request.durationDays());
        tour.setTourType(request.tourType());
        tour.setDescription(request.description());

        Tour saved = tourRepository.save(tour);
        return mapToTourResponse(saved);
    }

    /**
     * 2. Xóa một ảnh cụ thể của Tour
     */
    @Transactional
    public void deleteTourImage(Long imageId) {
        tourImageRepository.deleteById(imageId);
    }

    /**
     * 3. Lưu/Cập nhật lịch trình chi tiết (Ngày 1, Ngày 2...)
     */
    @Transactional
    public void updateItineraries(Long tourId, List<ItineraryRequest> requests) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour"));

        // Bước A: Xóa sạch lịch trình cũ của tour này
        itineraryRepository.deleteByTourTourId(tourId);

        // Bước B: Thêm danh sách mới
        List<Itinerary> newItineraries = requests.stream().map(req -> {
            Itinerary item = new Itinerary();
            item.setTour(tour);
            item.setDayNumber(req.dayNumber());
            item.setTitle(req.title());
            item.setDescription(req.description());
            return item;
        }).toList();

        itineraryRepository.saveAll(newItineraries);
    }
}