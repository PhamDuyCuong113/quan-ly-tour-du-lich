package com.touring.touringbackend.repository;

import com.touring.touringbackend.dto.tour.TopTourResponse;
import com.touring.touringbackend.entity.Booking;
import com.touring.touringbackend.entity.BookingStatus;
import com.touring.touringbackend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerCustomerId(Long customerId);

    List<Booking> findByTourScheduleScheduleId(Long scheduleId);

    boolean existsByCustomerCustomerIdAndStaffStaffId(Long customerId, Long staffId);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'CONFIRMED'")
    java.math.BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Long countSuccessfulBookings();

    // Staff: Chỉ thấy đơn mình tạo
    List<Booking> findByStaffStaffIdOrderByBookingDateDesc(Long staffId);

    // Staff: Chỉ thấy khách đã từng đặt đơn của mình
    @Query("SELECT DISTINCT b.customer FROM Booking b WHERE b.staff.staffId = :staffId")
    List<Customer> findCustomersByStaffId(@Param("staffId") Long staffId);

    @Query("""
    SELECT new com.touring.touringbackend.dto.tour.TopTourResponse(
        t.tourName,
        COUNT(b)
    )
    FROM Booking b
    JOIN b.tourSchedule s
    JOIN s.tour t
    WHERE b.status = 'CONFIRMED'
    GROUP BY t.tourName
    ORDER BY COUNT(b) DESC
    """)
    List<TopTourResponse> findTopTours();

    @Query("""
    SELECT SUM(b.totalPrice)
    FROM Booking b
    WHERE b.staff.staffId = :staffId
    AND b.status = 'CONFIRMED'
    """)
    BigDecimal getStaffRevenue(Long staffId);

    @Query("""
    SELECT b FROM Booking b
    JOIN FETCH b.tourSchedule ts
    JOIN FETCH ts.tour
    WHERE b.customer.customerId = :customerId
    """)
    List<Booking> findBookingsWithTour(Long customerId);

    long countByStatus(BookingStatus status);
    List<Booking> findTop5ByOrderByBookingDateDesc();
}
