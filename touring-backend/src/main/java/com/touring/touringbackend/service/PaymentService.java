package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.payment.PaymentRequest;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.BookingRepository;
import com.touring.touringbackend.repository.LoyaltyPointRepository;
import com.touring.touringbackend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j // Sử dụng để ghi Log chuyên nghiệp thay cho System.out
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final LoyaltyPointRepository loyaltyPointRepository;
    private final EmailService emailService;           // Inject thêm
    private final NotificationService notificationService; // Inject thêm

    @Transactional
    public String processPayment(Long bookingId, Long customerId, PaymentRequest request) {
        // 1. Tìm đơn hàng và kiểm tra quyền sở hữu
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + bookingId));

        Customer customer = booking.getCustomer();

        if (!customer.getCustomerId().equals(customerId)) {
            log.error("Cảnh báo bảo mật: User ID {} cố gắng thanh toán đơn hàng của User ID {}", customerId, customer.getCustomerId());
            throw new RuntimeException("Bạn không có quyền thanh toán cho đơn hàng này!");
        }

        // 2. Tạo bản ghi thanh toán (Payment)
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.amount());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.paymentMethod().toUpperCase()));
        payment.setPaymentDate(LocalDateTime.now());

        // 3. Kiểm tra số tiền trả có đủ không
        if (request.amount().compareTo(booking.getTotalPrice()) >= 0) {
            payment.setStatus(PaymentStatus.PAID);
            paymentRepository.save(payment);

            // A. Cập nhật trạng thái Booking sang CONFIRMED
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            // B. GỬI EMAIL XÁC NHẬN (Thực tế)
            if (customer.getEmail() != null) {
                try {
                    emailService.sendBookingConfirmation(
                            customer.getEmail(),
                            customer.getFullName(),
                            booking.getTourSchedule().getTour().getTourName(),
                            booking.getTotalPrice().toString()
                    );
                } catch (Exception e) {
                    log.error("Lỗi gửi email xác nhận cho đơn hàng {}: {}", bookingId, e.getMessage());
                }
            }

            // C. GỬI THÔNG BÁO TRONG APP
            notificationService.send(
                    customer.getAccount(),
                    "Thanh toán thành công",
                    "Đơn hàng #" + bookingId + " đã được xác nhận thanh toán."
            );

            // D. LOGIC CỘNG ĐIỂM THƯỞNG (100.000 VNĐ = 1 điểm)
            int pointsEarned = booking.getTotalPrice().divide(BigDecimal.valueOf(100000)).intValue();
            if (pointsEarned > 0) {
                updateCustomerPoints(customer, pointsEarned);
            }

            return "Thanh toán thành công! Bạn nhận được " + pointsEarned + " điểm thưởng.";
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return "Số tiền thanh toán không đủ! Đơn hàng vẫn ở trạng thái PENDING.";
        }
    }

    private void updateCustomerPoints(Customer customer, int points) {
        // 1. Tìm xem khách đã có trong bảng điểm chưa
        LoyaltyPoint loyaltyPoint = loyaltyPointRepository.findById(customer.getCustomerId())
                .orElseGet(() -> {
                    // 2. Nếu chưa có, tạo đối tượng mới hoàn toàn
                    LoyaltyPoint newLP = new LoyaltyPoint();
                    newLP.setCustomer(customer); // BẮT BUỘC: Để @MapsId lấy ID từ Customer gán sang
                    newLP.setTotalPoints(0);
                    newLP.setLevel(LoyaltyLevel.SILVER);
                    return newLP;
                });

        // 3. Cộng điểm mới vào tổng điểm hiện tại
        loyaltyPoint.setTotalPoints(loyaltyPoint.getTotalPoints() + points);

        // 4. Logic nâng hạng thành viên
        if (loyaltyPoint.getTotalPoints() >= 1000) {
            loyaltyPoint.setLevel(LoyaltyLevel.PLATINUM);
        } else if (loyaltyPoint.getTotalPoints() >= 500) {
            loyaltyPoint.setLevel(LoyaltyLevel.GOLD);
        } else {
            loyaltyPoint.setLevel(LoyaltyLevel.SILVER);
        }

        // 5. Lưu xuống DB
        loyaltyPointRepository.save(loyaltyPoint);
        log.info("Đã cập nhật điểm thành công cho khách hàng: {}. Tổng điểm: {}",
                customer.getFullName(), loyaltyPoint.getTotalPoints());
    }
}