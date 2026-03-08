package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.booking.BookingRequest;
import com.touring.touringbackend.dto.booking.BookingResponse;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final CustomerRepository customerRepository;
    private final PromotionRepository promotionRepository;
    private final NotificationService notificationService;
    private final StaffRepository staffRepository;

    /**
     * 1. Customer đặt tour
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + customerId));

        TourSchedule schedule = tourScheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình tour ID: " + request.scheduleId()));

        Tour tour = schedule.getTour();
        Staff tourOwner = tour.getStaff();

        if (schedule.getAvailableSlots() < request.numberOfPeople()) {
            throw new RuntimeException("Tour không đủ chỗ.");
        }

        BigDecimal totalPrice = schedule.getPrice()
                .multiply(BigDecimal.valueOf(request.numberOfPeople()));

        Promotion appliedPromotion = handlePromotion(
                request.promotionCode(),
                totalPrice,
                tourOwner
        );

        if (appliedPromotion != null) {

            BigDecimal discount = calculateDiscount(appliedPromotion, totalPrice);

            totalPrice = totalPrice.subtract(discount);

            appliedPromotion.setCurrentUsage(
                    appliedPromotion.getCurrentUsage() + 1
            );

            promotionRepository.save(appliedPromotion);
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setTourSchedule(schedule);
        booking.setPromotion(appliedPromotion);
        booking.setNumberOfPeople(request.numberOfPeople());
        booking.setTotalPrice(totalPrice.max(BigDecimal.ZERO));
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        schedule.setAvailableSlots(
                schedule.getAvailableSlots() - request.numberOfPeople()
        );

        tourScheduleRepository.save(schedule);

        notificationService.send(
                customer.getAccount(),
                "Đặt tour thành công",
                "Bạn đã đặt tour '" + tour.getTourName() + "' thành công."
        );

        return mapToResponse(savedBooking);
    }

    /**
     * 2. Lấy booking theo ID
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        return mapToResponse(booking);
    }

    /**
     * 3. Lịch sử booking của customer
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long customerId) {

        List<Booking> bookings =
                bookingRepository.findByCustomerCustomerId(customerId);

        return bookings.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * 4. Hủy booking
     */
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long customerId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        if (!booking.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Không có quyền hủy booking này.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Chỉ booking PENDING mới được hủy.");
        }

        TourSchedule schedule = booking.getTourSchedule();

        schedule.setAvailableSlots(
                schedule.getAvailableSlots() + booking.getNumberOfPeople()
        );

        tourScheduleRepository.save(schedule);

        if (booking.getPromotion() != null) {

            Promotion p = booking.getPromotion();

            if (p.getCurrentUsage() > 0) {
                p.setCurrentUsage(p.getCurrentUsage() - 1);
                promotionRepository.save(p);
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking saved = bookingRepository.save(booking);

        notificationService.send(
                booking.getCustomer().getAccount(),
                "Hủy tour thành công",
                "Đơn #" + booking.getBookingId() + " đã được hủy."
        );

        return mapToResponse(saved);
    }

    /**
     * 5. Staff đặt tour thủ công cho khách
     */
    @Transactional
    public BookingResponse createManualBooking(
            BookingRequest request,
            Long staffId,
            Long customerId
    ) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy staff"));

        TourSchedule schedule = tourScheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình"));

        if (schedule.getAvailableSlots() < request.numberOfPeople()) {
            throw new RuntimeException("Tour không đủ chỗ.");
        }

        BigDecimal totalPrice = schedule.getPrice()
                .multiply(BigDecimal.valueOf(request.numberOfPeople()));

        Booking booking = new Booking();

        booking.setCustomer(customer);
        booking.setStaff(staff);
        booking.setTourSchedule(schedule);
        booking.setNumberOfPeople(request.numberOfPeople());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);

        schedule.setAvailableSlots(
                schedule.getAvailableSlots() - request.numberOfPeople()
        );

        tourScheduleRepository.save(schedule);

        return mapToResponse(savedBooking);
    }

    /**
     * Xử lý promotion
     */
    private Promotion handlePromotion(
            String code,
            BigDecimal totalPrice,
            Staff tourOwner
    ) {

        if (code == null || code.isBlank()) {
            return null;
        }

        Promotion promo = promotionRepository
                .findByCodeAndStatus(code, PromotionStatus.ACTIVE)
                .orElseThrow(() ->
                        new RuntimeException("Mã giảm giá không tồn tại"));

        Staff promoOwner = promo.getStaff();

        if (promoOwner != null) {

            if (tourOwner == null ||
                    !promoOwner.getStaffId().equals(tourOwner.getStaffId())) {

                throw new RuntimeException(
                        "Voucher chỉ áp dụng cho tour của " +
                                promoOwner.getFullName()
                );
            }
        }

        LocalDate now = LocalDate.now();

        if (now.isBefore(promo.getStartDate()) ||
                now.isAfter(promo.getEndDate())) {

            throw new RuntimeException("Voucher hết hạn");
        }

        if (promo.getUsageLimit() != null &&
                promo.getCurrentUsage() >= promo.getUsageLimit()) {

            throw new RuntimeException("Voucher đã hết lượt");
        }

        return promo;
    }

    /**
     * Tính discount
     */
    private BigDecimal calculateDiscount(
            Promotion promo,
            BigDecimal totalPrice
    ) {

        if (promo.getDiscountType() == DiscountType.PERCENT) {

            return totalPrice.multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP);
        }

        return promo.getDiscountValue();
    }

    /**
     * Mapping
     */
    private BookingResponse mapToResponse(Booking booking) {

        return new BookingResponse(
                booking.getBookingId(),
                booking.getTourSchedule().getTour().getTourName(),
                booking.getCustomer().getFullName(),
                booking.getNumberOfPeople(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getBookingDate()
        );
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Logic: Nếu chuyển sang CONFIRMED (PAID), tự động trừ số lượng slot nếu chưa trừ
        if (newStatus == BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.CONFIRMED) {
            // Logic cộng điểm thưởng tại đây (nếu thanh toán thành công)
            // notificationService.send(...);
        }

        booking.setStatus(newStatus);
        return mapToResponse(bookingRepository.save(booking));
    }
}