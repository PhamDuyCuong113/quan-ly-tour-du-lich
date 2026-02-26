package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    // Hàm này cực kỳ quan trọng để lấy staffId lúc đăng nhập
    Optional<Staff> findByAccountAccountId(Long accountId);
}