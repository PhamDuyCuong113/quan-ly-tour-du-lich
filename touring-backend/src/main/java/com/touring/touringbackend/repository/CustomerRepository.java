package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByAccountAccountId(Long accountId);


    @Query("SELECT DISTINCT b.customer FROM Booking b " +
            "WHERE b.tourSchedule.tour.staff.id = :staffId")
    List<Customer> findCustomersByStaffId(@Param("staffId") Long staffId);
}
