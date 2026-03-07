package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Booking;
import com.touring.touringbackend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
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
}
