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

    /**
     * 1. Đặt tour mới kèm theo logic kiểm tra mã giảm giá theo chủ sở hữu (Multi-vendor)
     */
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long customerId) {
        // A. Tìm khách hàng
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + customerId));

        // B. Tìm lịch trình và xác định chủ sở hữu Tour (Staff nào)
        TourSchedule schedule = tourScheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình tour ID: " + request.scheduleId()));

        Tour tour = schedule.getTour();
        Staff tourOwner = tour.getStaff(); // Đây là Staff quản lý tour này

        // C. Kiểm tra chỗ trống
        if (schedule.getAvailableSlots() < request.numberOfPeople()) {
            throw new RuntimeException("Tour này không đủ chỗ cho " + request.numberOfPeople() + " người.");
        }

        // --- BẮT ĐẦU TÍNH TOÁN GIÁ TIỀN ---
        BigDecimal totalPrice = schedule.getPrice().multiply(BigDecimal.valueOf(request.numberOfPeople()));

        // D. Xử lý khuyến mãi (Promotion) - LOGIC MỚI: KIỂM TRA CHỦ SỞ HỮU VOUCHER
        Promotion appliedPromotion = null;
        if (request.promotionCode() != null && !request.promotionCode().isBlank()) {
            appliedPromotion = promotionRepository.findByCodeAndStatus(request.promotionCode(), PromotionStatus.ACTIVE)
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã hết hạn"));

            // 1. Kiểm tra "Hộ khẩu" của Voucher
            Staff promoOwner = appliedPromotion.getStaff();

            if (promoOwner != null) {
                // ĐÂY LÀ VOUCHER CỦA STAFF: Phải kiểm tra xem chủ voucher có đúng là chủ tour không
                if (tourOwner == null || !promoOwner.getStaffId().equals(tourOwner.getStaffId())) {
                    throw new RuntimeException("Mã giảm giá này chỉ áp dụng cho các tour của đại lý: " + promoOwner.getFullName());
                }
            }
            // Nếu promoOwner == null: Đây là VOUCHER CỦA ADMIN -> Được áp dụng cho toàn sàn (mọi Tour)

            // 2. Kiểm tra thời hạn
            LocalDate now = LocalDate.now();
            if (now.isBefore(appliedPromotion.getStartDate()) || now.isAfter(appliedPromotion.getEndDate())) {
                throw new RuntimeException("Mã giảm giá hiện không trong thời gian sử dụng");
            }

            // 3. Kiểm tra giới hạn lượt dùng
            if (appliedPromotion.getUsageLimit() != null && appliedPromotion.getCurrentUsage() >= appliedPromotion.getUsageLimit()) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
            }

            // 4. Tính toán số tiền được giảm
            BigDecimal discountAmount = BigDecimal.ZERO;
            if (appliedPromotion.getDiscountType() == DiscountType.PERCENT) {
                // Giảm theo % (VD: 10%). Thêm RoundingMode để tránh lỗi chia số thập phân vô hạn
                discountAmount = totalPrice.multiply(appliedPromotion.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                // Giảm số tiền cố định
                discountAmount = appliedPromotion.getDiscountValue();
            }

            totalPrice = totalPrice.subtract(discountAmount);

            // Cập nhật số lượt đã dùng của mã
            appliedPromotion.setCurrentUsage(appliedPromotion.getCurrentUsage() + 1);
            promotionRepository.save(appliedPromotion);
        }

        // --- LƯU ĐƠN HÀNG ---
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setTourSchedule(schedule);
        booking.setPromotion(appliedPromotion);
        booking.setNumberOfPeople(request.numberOfPeople());
        booking.setTotalPrice(totalPrice.max(BigDecimal.ZERO)); // Đảm bảo không âm
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // GỬI THÔNG BÁO THÀNH CÔNG VÀO HỆ THỐNG
        notificationService.send(
                customer.getAccount(),
                "Đặt tour thành công",
                "Chúc mừng bạn đã đặt tour '" + tour.getTourName() + "' thành công! Vui lòng thanh toán để xác nhận chỗ."
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
        // Lưu ý: Đảm bảo BookingRepository đã có hàm findByCustomerCustomerId
        List<Booking> bookings = bookingRepository.findByCustomerCustomerId(customerId);
        return bookings.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * 4. Hủy đặt tour (Hoàn lại slot và lượt dùng mã giảm giá)
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

        // Hoàn lại lượt dùng mã giảm giá nếu có
        if (booking.getPromotion() != null) {
            Promotion p = booking.getPromotion();
            if (p.getCurrentUsage() > 0) {
                p.setCurrentUsage(p.getCurrentUsage() - 1);
                promotionRepository.save(p);
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        // GỬI THÔNG BÁO HỦY TOUR
        notificationService.send(
                booking.getCustomer().getAccount(),
                "Hủy tour thành công",
                "Đơn hàng #" + booking.getBookingId() + " của bạn đã được hủy thành công."
        );

        return mapToResponse(savedBooking);
    }

    /**
     * Hàm hỗ trợ: Mapping Entity -> DTO (Đã đồng bộ kiểu Enum sang String)
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