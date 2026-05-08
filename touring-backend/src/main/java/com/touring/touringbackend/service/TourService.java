package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.passenger.PassengerResponse;
import com.touring.touringbackend.dto.tour.*;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.*;
import com.touring.touringbackend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TourService {

    private final TourRepository tourRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final ReviewRepository reviewRepository;
    private final TourImageRepository tourImageRepository;
    private final ItineraryRepository itineraryRepository;
    private final StaffRepository staffRepository;
    private final PassengerRepository passengerRepository; // ĐÃ BỔ SUNG Ở ĐÂY
    private final CloudinaryService cloudinaryService;

    @Value("${upload.path}")
    private String uploadPath;

    /* ==========================================================
       1. DÀNH CHO KHÁCH HÀNG (PUBLIC APIs)
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
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));

        Double avgRating = reviewRepository.getAverageRating(tourId, ReviewStatus.VISIBLE);
        Long totalReviews = reviewRepository.countReviews(tourId, ReviewStatus.VISIBLE);

        List<TourDetailResponse.ScheduleDTO> scheduleDTOs = tour.getSchedules().stream()
                .filter(s -> s.getStatus() == TourScheduleStatus.OPEN)
                .map(s -> new TourDetailResponse.ScheduleDTO(
                        s.getScheduleId(),
                        s.getDepartureDate(),
                        s.getReturnDate(),
                        s.getMaxSlots(),
                        s.getAvailableSlots(),
                        s.getPrice()
                )).toList();

        List<TourDetailResponse.ItineraryDTO> itineraryDTOs = tour.getItineraries().stream()
                .sorted(Comparator.comparing(Itinerary::getDayNumber))
                .map(it -> new TourDetailResponse.ItineraryDTO(
                        it.getItineraryId(), it.getDayNumber(), it.getTitle(), it.getDescription()
                )).toList();

        List<TourDetailResponse.ImageDTO> imageDTOs = (tour.getImages() == null) ? List.of()
            : tour.getImages().stream()
            .map(img -> new TourDetailResponse.ImageDTO(
                img.getImageId(),
                img.getImageUrl(),
                img.getPublicId(),
                img.getCaption()
            ))
            .toList();

        return new TourDetailResponse(
                tour.getTourId(),
                tour.getTourCode() != null ? tour.getTourCode() : "N/A", // Check null
                tour.getTourName(),
                tour.getDescription(),
                tour.getDestination(),
                tour.getBasePrice(),
                tour.getTourType() != null ? tour.getTourType().name() : "DOMESTIC", // Check null
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                totalReviews != null ? totalReviews : 0L,
            imageDTOs,
                scheduleDTOs,
                itineraryDTOs
        );
    }

    @Transactional(readOnly = true)
    public List<TourResponse> searchTours(String keyword, BigDecimal minPrice, BigDecimal maxPrice,
                                          LocalDate startDate, LocalDate endDate, String sortBy) {
        List<Tour> tours = tourRepository.advancedSearch(keyword, minPrice, maxPrice, startDate, endDate, null);
        sortTours(tours, sortBy);
        return tours.stream().map(this::mapToTourResponse).toList();
    }

    public List<TourResponse> getRelatedTours(Long tourId) {
        Tour currentTour = tourRepository.findById(tourId).orElseThrow();
        return tourRepository.findTop4ByDestinationContainingIgnoreCaseAndTourIdNotAndStatus(
                        currentTour.getDestination(), tourId, TourStatus.OPEN)
                .stream().map(this::mapToTourResponse).toList();
    }

    /* ==========================================================
       2. DÀNH CHO QUẢN TRỊ (ADMIN & STAFF)
       ========================================================== */

    @Transactional(readOnly = true)
    public List<TourResponse> searchToursForManagement(String keyword, BigDecimal minPrice, BigDecimal maxPrice,
                                                       LocalDate startDate, LocalDate endDate, String sortBy,
                                                       CustomUserDetails currentUser) {
        boolean includeDeleted = true; // Admin/Staff đều xem toàn bộ tour
        List<Tour> tours = tourRepository.advancedSearchForManagement(
                keyword,
                minPrice,
                maxPrice,
                startDate,
                endDate,
                null,
                includeDeleted
        );
        sortTours(tours, sortBy);
        return tours.stream().map(this::mapToTourResponse).toList();
    }

    @Transactional
    public TourResponse createTour(TourCreateRequest request, CustomUserDetails currentUser) {
        if (tourRepository.existsByTourCode(request.tourCode())) {
            throw new RuntimeException("Mã Tour đã tồn tại!");
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
        tour.setDeleted(false);

        if (currentUser.getStaffId() != null) {
            tour.setStaff(staffRepository.getReferenceById(currentUser.getStaffId()));
        }
        return mapToTourResponse(tourRepository.save(tour));
    }

    @Transactional
    public TourResponse updateTour(Long id, TourCreateRequest request, CustomUserDetails currentUser) {
        Tour tour = tourRepository.findById(id).orElseThrow();
        checkOwnership(tour, currentUser);

        tour.setTourName(request.tourName());
        tour.setDestination(request.destination());
        tour.setBasePrice(request.basePrice());
        tour.setDurationDays(request.durationDays());
        tour.setTourType(request.tourType());
        tour.setDescription(request.description());

        return mapToTourResponse(tourRepository.save(tour));
    }

    @Transactional
    public void deleteTour(Long id, CustomUserDetails currentUser) {
        Tour tour = tourRepository.findById(id).orElseThrow();
        checkOwnership(tour, currentUser);

        boolean nextDeleted = !tour.isDeleted();
        tour.setDeleted(nextDeleted);
        tour.setStatus(nextDeleted ? TourStatus.CLOSED : TourStatus.OPEN);
        tourRepository.save(tour);
    }

    /* ==========================================================
       3. QUẢN LÝ THÀNH PHẦN (LỊCH TRÌNH, ẢNH, ITINERARY)
       ========================================================== */

    @Transactional
    public void updateItineraries(Long tourId, List<ItineraryRequest> requests, CustomUserDetails currentUser) {
        Tour tour = tourRepository.findById(tourId).orElseThrow();
        checkOwnership(tour, currentUser);

        itineraryRepository.forceDeleteByTourId(tourId);
        itineraryRepository.flush();

        List<Itinerary> newItems = requests.stream().map(req -> {
            Itinerary it = new Itinerary();
            it.setTour(tour);
            it.setDayNumber(req.dayNumber());
            it.setTitle(req.title());
            it.setDescription(req.description());
            return it;
        }).toList();

        itineraryRepository.saveAll(newItems);
    }

    @Transactional
    public String createSchedule(Long tourId, ScheduleRequest request, CustomUserDetails currentUser) {
        Tour tour = tourRepository.findById(tourId).orElseThrow();
        checkOwnership(tour, currentUser);

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
        return "Thành công";
    }

    @Transactional
    public void updateSchedule(Long scheduleId, ScheduleRequest request, CustomUserDetails currentUser) {
        TourSchedule schedule = tourScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));
        checkOwnership(schedule.getTour(), currentUser);

        schedule.setDepartureDate(request.departureDate());
        schedule.setReturnDate(request.returnDate());
        schedule.setPrice(request.price());
        schedule.setMaxSlots(request.maxSlots());

        tourScheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId, CustomUserDetails currentUser) {
        TourSchedule schedule = tourScheduleRepository.findById(scheduleId).orElseThrow();
        checkOwnership(schedule.getTour(), currentUser);
        tourScheduleRepository.delete(schedule);
    }

    @Transactional
    public void uploadTourImages(Long tourId, MultipartFile[] files, CustomUserDetails currentUser) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));

        checkOwnership(tour, currentUser); // Kiểm tra quyền chủ tour

        for (MultipartFile file : files) {
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, tourId);
            String imageUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            if (imageUrl == null || publicId == null) {
                throw new RuntimeException("Lỗi khi upload ảnh: thiếu URL hoặc public_id");
            }

            TourImage tourImage = new TourImage();
            tourImage.setTour(tour);
            tourImage.setImageUrl(imageUrl);
            tourImage.setPublicId(publicId);
            tourImageRepository.save(tourImage);
        }
    }

    @Transactional
    public void deleteTourImage(Long imageId, CustomUserDetails currentUser) {
        TourImage img = tourImageRepository.findById(imageId).orElseThrow();
        checkOwnership(img.getTour(), currentUser);
        if (img.getPublicId() != null) {
            cloudinaryService.deleteImage(img.getPublicId());
        }
        tourImageRepository.delete(img);
    }

    /**
     * STAFF XEM DANH SÁCH KHÁCH CỦA TOUR MÌNH
     */
    @Transactional(readOnly = true)
    public List<PassengerResponse> getPassengersByTour(Long tourId, CustomUserDetails currentUser) {
        Tour tour = tourRepository.findById(tourId).orElseThrow();
        checkOwnership(tour, currentUser);

        return passengerRepository.findByBookingTourScheduleTourTourId(tourId).stream()
                .map(p -> new PassengerResponse(p.getFullName(), p.getGender().name(), p.getDateOfBirth(), p.getIdNumber()))
                .toList();
    }

    /* ==========================================================
       4. HÀM HỖ TRỢ (HELPER)
       ========================================================== */

    private void checkOwnership(Tour tour, CustomUserDetails user) {
        if (user.getRole().equals("ADMIN")) return;
        if (tour.getStaff() == null || !tour.getStaff().getStaffId().equals(user.getStaffId())) {
            throw new RuntimeException("Bạn không phải chủ sở hữu của Tour này!");
        }
    }

    private void sortTours(List<Tour> tours, String sortBy) {
        String normalizedSort = (sortBy == null || sortBy.isBlank()) ? "newest" : sortBy;
        switch (normalizedSort) {
            case "price_asc" -> tours.sort(Comparator.comparing(Tour::getBasePrice));
            case "price_desc" -> tours.sort((t1, t2) -> t2.getBasePrice().compareTo(t1.getBasePrice()));
            default -> tours.sort((t1, t2) -> {
                if (t1.getCreatedAt() == null && t2.getCreatedAt() == null) return t2.getTourId().compareTo(t1.getTourId());
                if (t1.getCreatedAt() == null) return 1;
                if (t2.getCreatedAt() == null) return -1;
                return t2.getCreatedAt().compareTo(t1.getCreatedAt());
            });
        }
    }

    private TourResponse mapToTourResponse(Tour t) {
        Double avgRating = reviewRepository.getAverageRating(t.getTourId(), ReviewStatus.VISIBLE);
        Long totalReviews = reviewRepository.countReviews(t.getTourId(), ReviewStatus.VISIBLE);
        String firstImageUrl = (t.getImages() != null && !t.getImages().isEmpty()) ? t.getImages().get(0).getImageUrl() : null;
        String staffName = (t.getStaff() != null) ? t.getStaff().getFullName() : "Hệ thống";
        String status = t.isDeleted() ? TourStatus.CLOSED.name() : TourStatus.OPEN.name();

        return new TourResponse(
                t.getTourId(), t.getTourCode(), t.getTourName(), t.getDestination(),
                t.getBasePrice(), t.getDurationDays(), firstImageUrl,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                totalReviews != null ? totalReviews : 0L,
                staffName,
                t.getCreatedAt(),
                status
        );
    }
}