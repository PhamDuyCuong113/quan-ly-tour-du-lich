package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByAccountAccountId(Long accountId);

}
