package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.admin.AdminStatsResponse;
import com.touring.touringbackend.dto.admin.CustomerResponse;
import com.touring.touringbackend.dto.admin.StaffResponse;
import com.touring.touringbackend.dto.auth.RegisterRequest;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Lấy thống kê doanh thu toàn sàn
     */
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        BigDecimal revenue = bookingRepository.getTotalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        Long bookings = bookingRepository.countSuccessfulBookings();
        Long customers = customerRepository.count();

        return new AdminStatsResponse(revenue, bookings, customers);
    }

    /**
     * Quản lý nhân viên: Lấy danh sách DTO
     */
    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaffs() {
        return staffRepository.findAll().stream().map(s -> new StaffResponse(
                s.getStaffId(),
                s.getFullName() != null ? s.getFullName() : "N/A",
                s.getEmail() != null ? s.getEmail() : "Chưa có Email",
                s.getPhone() != null ? s.getPhone() : "Chưa có SĐT",
                // Nếu NULL thì mặc định trả về ACTIVE để hiển thị màu xanh
                s.getAccount() != null ? s.getAccount().getUsername() : "N/A",
                s.getStatus() != null ? s.getStatus().name() : "ACTIVE"

        )).toList();
    }

    /**
     * Quản lý khách hàng: Lấy danh sách DTO kèm trạng thái tài khoản
     */
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream().map(c -> {
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
                    c.getCustomerType() != null ? c.getCustomerType() : CustomerType.NORMAL,
                    points,
                    level, // Ở DTO nếu để String thì dùng .name()
                    c.getAccount() != null ? c.getAccount().getStatus().name() : "LOCKED"
            );
        }).toList();
    }

    /**
     * Tạo tài khoản nhân viên mới (Role STAFF)
     */
    @Transactional
    public String createStaffAccount(RegisterRequest req) {
        if (accountRepository.existsByUsername(req.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // 1. Tạo Account
        Account acc = new Account();
        acc.setUsername(req.username());
        acc.setPasswordHash(passwordEncoder.encode(req.password()));
        acc.setRole(AccountRole.STAFF);
        acc.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(acc);

        // 2. Tạo Staff gắn với Account
        Staff staff = new Staff();
        staff.setAccount(acc);
        staff.setFullName(req.fullName());
        staff.setEmail(req.email());
        staff.setPhone(req.phone());
        staff.setStatus(StaffStatus.ACTIVE);
        staffRepository.save(staff);

        return "Tạo tài khoản nhân viên thành công!";
    }

    /**
     * Khóa/Mở khóa Nhân viên
     */
    @Transactional
    public void toggleStaffStatus(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        StaffStatus newStatus = (staff.getStatus() == StaffStatus.ACTIVE) ? StaffStatus.INACTIVE : StaffStatus.ACTIVE;
        staff.setStatus(newStatus);

        if (staff.getAccount() != null) {
            staff.getAccount().setStatus(newStatus == StaffStatus.ACTIVE ? AccountStatus.ACTIVE : AccountStatus.LOCKED);
        }
        staffRepository.save(staff);
    }

    /**
     * MỚI: Khóa/Mở khóa Khách hàng (Dành cho nút bấm ở trang Quản lý khách hàng)
     */
    @Transactional
    public void toggleCustomerStatus(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Account acc = customer.getAccount();
        if (acc == null) throw new RuntimeException("Khách hàng không có tài khoản đăng nhập");

        // Logic an toàn: Nếu status bị NULL thì coi như đang ACTIVE để khóa lại
        AccountStatus currentStatus = acc.getStatus();
        if (currentStatus == null || currentStatus == AccountStatus.ACTIVE) {
            acc.setStatus(AccountStatus.LOCKED);
        } else {
            acc.setStatus(AccountStatus.ACTIVE);
        }

        accountRepository.save(acc);
    }

    // Trong AdminService.java
    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomersByStaff(Long staffId) {
        // Chỉ lấy những khách đã đặt tour của Staff này
        return customerRepository.findCustomersByStaffId(staffId).stream().map(c -> {
            int points = 0;
            String level = "SILVER";
            if (c.getLoyaltyPoint() != null) {
                points = c.getLoyaltyPoint().getTotalPoints();
                level = c.getLoyaltyPoint().getLevel().name();
            }
            return new CustomerResponse(
                    c.getCustomerId(),
                    c.getFullName(),
                    c.getEmail(),
                    c.getPhone(),
                    c.getCustomerType() != null ? c.getCustomerType().name() : "NORMAL",
                    points,
                    level,
                    // Staff vẫn thấy trạng thái nhưng không được sửa
                    c.getAccount() != null ? c.getAccount().getStatus().name() : "ACTIVE"
            );
        }).toList();
    }
}