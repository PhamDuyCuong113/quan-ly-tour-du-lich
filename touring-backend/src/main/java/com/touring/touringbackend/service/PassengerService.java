package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.passenger.PassengerRequest;
import com.touring.touringbackend.dto.passenger.PassengerResponse;
import com.touring.touringbackend.entity.Booking;
import com.touring.touringbackend.entity.Gender;
import com.touring.touringbackend.entity.Passenger;
import com.touring.touringbackend.repository.BookingRepository;
import com.touring.touringbackend.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PassengerService {

    private final PassengerRepository passengerRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public String addPassenger(Long bookingId, Long customerId, List<PassengerRequest> requests){
        // 1. Kiểm tra đơn hàng có tồn tại và thuộc về khách hàng này không
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt tour"));

        if (!booking.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa đơn hàng này!");
        }

        // 2. Kiểm tra số lượng người gửi lên có khớp với số lượng đã đặt không
        if (requests.size() > booking.getNumberOfPeople()) {
            throw new RuntimeException("Số lượng hành khách vượt quá số chỗ đã đặt!");
        }

        // 3. Chuyển đổi DTO sang Entity và lưu
        List<Passenger> passengers = requests.stream().map(req -> {
            Passenger p = new Passenger();
            p.setBooking(booking);
            p.setFullName(req.fullName());
            p.setGender(Gender.valueOf(req.gender().toUpperCase()));
            p.setDateOfBirth(req.dateOfBirth());
            p.setIdNumber(req.idNumber());
            return p;
        }).toList();

        passengerRepository.saveAll(passengers);
        return "Đã cập nhật danh sách " + passengers.size() + " hành khách thành công.";
    }

    // Thêm vào PassengerService.java

    public List<PassengerResponse> getAllPassengersInSchedule(Long scheduleId) {
        List<Passenger> passengers = passengerRepository.findByBookingTourScheduleScheduleId(scheduleId);

        return passengers.stream()
                .map(p -> new PassengerResponse(
                        p.getFullName(),
                        p.getGender().name(),
                        p.getDateOfBirth(),
                        p.getIdNumber()
                )).toList();
    }
}
