package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    List<Passenger> findByBookingBookingId(Long bookingId);

    List<Passenger> findByBookingTourScheduleScheduleId(Long scheduleId);
}
