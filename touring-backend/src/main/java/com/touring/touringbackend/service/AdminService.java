package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.admin.AdminStatsResponse;
import com.touring.touringbackend.dto.admin.CustomerResponse;
import com.touring.touringbackend.dto.auth.RegisterRequest;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.AccountRepository;
import com.touring.touringbackend.repository.BookingRepository;
import com.touring.touringbackend.repository.CustomerRepository;
import com.touring.touringbackend.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsResponse getStats() {
        BigDecimal revenue = bookingRepository.getTotalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        Long bookings = bookingRepository.countSuccessfulBookings();
        Long customers = customerRepository.count();

        return new AdminStatsResponse(revenue, bookings, customers);
    }

    public List<Staff> getAllStaffs() {
        return staffRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream().map(c -> {
            // Lấy thông tin điểm nếu có, không có thì mặc định 0
            int points = 0;
            LoyaltyLevel level = LoyaltyLevel.SILVER;

            if (c.getLoyaltyPoint() != null) {
                points = c.getLoyaltyPoint().getTotalPoints();
                level = c.getLoyaltyPoint().getLevel();
            }

            return new CustomerResponse(
                    c.getCustomerId(),
                    c.getFullName(),
                    c.getEmail(),
                    c.getPhone(),
                    c.getCustomerType(),
                    points,
                    level
            );
        }).toList();
    }
    // Tạo tài khoản Staff (Kết hợp tạo Account và Staff)
    @Transactional
    public String createStaffAccount(RegisterRequest req) {
        if (accountRepository.existsByUsername(req.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        // 1. Tạo Account role STAFF
        Account acc = new Account();
        acc.setUsername(req.username());
        acc.setPasswordHash(passwordEncoder.encode(req.password()));
        acc.setRole(AccountRole.STAFF);
        acc.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(acc);

        // 2. Tạo bản ghi Staff
        Staff staff = new Staff();
        staff.setAccount(acc);
        staff.setFullName(req.fullName());
        staff.setEmail(req.email());
        staff.setPhone(req.phone());
        staff.setStatus(StaffStatus.ACTIVE);
        staffRepository.save(staff);

        return "Tạo tài khoản nhân viên thành công!";
    }
    @Transactional
    public void toggleStaffStatus(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        // Đổi trạng thái Staff
        StaffStatus newStatus = (staff.getStatus() == StaffStatus.ACTIVE)
                ? StaffStatus.INACTIVE : StaffStatus.ACTIVE;
        staff.setStatus(newStatus);

        // Đồng bộ khóa luôn tài khoản đăng nhập (Account)
        Account acc = staff.getAccount();
        acc.setStatus(newStatus == StaffStatus.ACTIVE ? AccountStatus.ACTIVE : AccountStatus.LOCKED);

        staffRepository.save(staff);
        accountRepository.save(acc);
    }
}