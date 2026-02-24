package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.booking.BookingRequest;
import com.touring.touringbackend.dto.booking.BookingResponse;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final CustomerRepository customerRepository;
    private final PromotionRepository promotionRepository; // Cần inject thêm cái này
    private final NotificationService notificationService;
    /**
     * 1. Đặt tour mới kèm theo áp dụng mã giảm giá
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long customerId) {
        // Tìm khách hàng
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + customerId));

        // Tìm lịch trình
        TourSchedule schedule = tourScheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình tour ID: " + request.scheduleId()));

        // Kiểm tra chỗ trống của tour
        if (schedule.getAvailableSlots() < request.numberOfPeople()) {
            throw new RuntimeException("Tour này không đủ chỗ cho " + request.numberOfPeople() + " người.");
        }

        // --- BẮT ĐẦU TÍNH TOÁN GIÁ TIỀN ---

        // A. Tính giá gốc (Giá lịch trình * số người)
        BigDecimal totalPrice = schedule.getPrice().multiply(BigDecimal.valueOf(request.numberOfPeople()));

        // B. Xử lý khuyến mãi (Promotion)
        Promotion appliedPromotion = null;
        if (request.promotionCode() != null && !request.promotionCode().isBlank()) {
            // 1. Tìm mã đang hoạt động (ACTIVE)
            appliedPromotion = promotionRepository.findByCodeAndStatus(request.promotionCode(), PromotionStatus.ACTIVE)
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã hết hạn"));

            // 2. Kiểm tra thời hạn sử dụng mã
            LocalDate now = LocalDate.now();
            if (now.isBefore(appliedPromotion.getStartDate()) || now.isAfter(appliedPromotion.getEndDate())) {
                throw new RuntimeException("Mã giảm giá hiện không trong thời gian sử dụng");
            }

            // 3. Kiểm tra giới hạn lượt dùng (usageLimit)
            if (appliedPromotion.getUsageLimit() != null && appliedPromotion.getUsageLimit() > 0) {
                if (appliedPromotion.getCurrentUsage() >= appliedPromotion.getUsageLimit()) {
                    throw new RuntimeException("Mã giảm giá '" + request.promotionCode() + "' đã hết lượt sử dụng!");
                }
            }

            // 4. Tính toán số tiền được giảm
            BigDecimal discountAmount = BigDecimal.ZERO;
            if (appliedPromotion.getDiscountType() == DiscountType.PERCENT) {
                // Giảm theo % (VD: 10% của 5 triệu = 500k)
                discountAmount = totalPrice.multiply(appliedPromotion.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
            } else {
                // Giảm số tiền cố định (VD: Giảm thẳng 200k)
                discountAmount = appliedPromotion.getDiscountValue();
            }

            // 5. Trừ tiền và đảm bảo giá không âm
            totalPrice = totalPrice.subtract(discountAmount);
            if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
                totalPrice = BigDecimal.ZERO;
            }

            // 6. Cập nhật số lượt đã dùng của mã này vào DB
            appliedPromotion.setCurrentUsage(appliedPromotion.getCurrentUsage() + 1);
            promotionRepository.save(appliedPromotion);
        }

        // --- LƯU ĐƠN HÀNG ---

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setTourSchedule(schedule);
        booking.setPromotion(appliedPromotion); // Lưu vết mã giảm giá đã dùng
        booking.setNumberOfPeople(request.numberOfPeople());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // GỬI THÔNG BÁO THÀNH CÔNG
        notificationService.send(
                customer.getAccount(),
                "Đặt tour thành công",
                "Chúc mừng bạn đã đặt tour " + schedule.getTour().getTourName() + " thành công!"
        );


        // Cập nhật lại số lượng chỗ còn trống của tour
        schedule.setAvailableSlots(schedule.getAvailableSlots() - request.numberOfPeople());
        tourScheduleRepository.save(schedule);

        return mapToResponse(savedBooking);
    }

    /**
     * 2. Lấy chi tiết một Booking theo ID
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt tour ID: " + bookingId));
        return mapToResponse(booking);
    }

    /**
     * 3. Lấy danh sách lịch sử đặt tour của một khách hàng
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long customerId) {
        List<Booking> bookings = bookingRepository.findByCustomerCustomerId(customerId);
        return bookings.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * 4. Hủy đặt tour (Hoàn lại slot tour và mã giảm giá nếu cần)
     */
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long customerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt tour ID: " + bookingId));

        if (!booking.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn đặt tour của người khác!");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Chỉ đơn hàng ở trạng thái PENDING mới được phép hủy.");
        }

        // Hoàn lại slot tour
        TourSchedule schedule = booking.getTourSchedule();
        schedule.setAvailableSlots(schedule.getAvailableSlots() + booking.getNumberOfPeople());
        tourScheduleRepository.save(schedule);

        // (Tùy chọn) Hoàn lại lượt dùng mã giảm giá nếu tour bị hủy
        if (booking.getPromotion() != null) {
            Promotion p = booking.getPromotion();
            if (p.getCurrentUsage() > 0) {
                p.setCurrentUsage(p.getCurrentUsage() - 1);
                promotionRepository.save(p);
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        // GỬI THÔNG BÁO HỦY TOUR (Nên có)
        notificationService.send(
                booking.getCustomer().getAccount(),
                "Hủy tour thành công",
                "Đơn hàng #" + booking.getBookingId() + " của bạn đã được hủy."
        );

        return mapToResponse(savedBooking);
    }

    /**
     * Hàm hỗ trợ: Mapping Entity -> DTO
     */
    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getBookingId(),
                booking.getTourSchedule().getTour().getTourName(),
                booking.getCustomer().getFullName(),
                booking.getNumberOfPeople(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getBookingDate()
        );
    }


}