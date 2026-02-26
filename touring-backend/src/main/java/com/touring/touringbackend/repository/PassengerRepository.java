package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    // Lấy khách cho 1 ngày khởi hành cụ thể
    List<Passenger> findByBookingTourScheduleScheduleId(Long scheduleId);

    // Lấy TOÀN BỘ khách đã đặt của 1 Tour (tất cả các ngày cộng lại)
    List<Passenger> findByBookingTourScheduleTourTourId(Long tourId);
}