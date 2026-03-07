package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.admin.*;
import com.touring.touringbackend.dto.admin.CustomerDetailResponse;
import com.touring.touringbackend.dto.admin.CustomerResponse;
import com.touring.touringbackend.dto.admin.StaffResponse;
import com.touring.touringbackend.dto.auth.RegisterRequest;
import com.touring.touringbackend.dto.booking.BookingResponse;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.*;
import com.touring.touringbackend.security.CustomUserDetails;
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

    /*
     ===============================
     DASHBOARD STATS
     ===============================
     */

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats(CustomUserDetails currentUser) {

        if (currentUser.getRole().equals("ADMIN")) {

            BigDecimal revenue = bookingRepository.getTotalRevenue();

            return new AdminStatsResponse(
                    revenue != null ? revenue : BigDecimal.ZERO,
                    bookingRepository.countSuccessfulBookings(),
                    customerRepository.count()
            );
        }


        List<Booking> staffBookings =
                bookingRepository.findByStaffStaffIdOrderByBookingDateDesc(currentUser.getStaffId());

        BigDecimal staffRevenue = staffBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminStatsResponse(
                staffRevenue,
                (long) staffBookings.size(),
                0L
        );
    }

    /*
     ===============================
     STAFF MANAGEMENT
     ===============================
     */

    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaffs() {

        return staffRepository.findAll()
                .stream()
                .map(s -> new StaffResponse(
                        s.getStaffId(),
                        s.getFullName() != null ? s.getFullName() : "N/A",
                        s.getEmail() != null ? s.getEmail() : "Chưa có Email",
                        s.getPhone() != null ? s.getPhone() : "Chưa có SĐT",
                        s.getAccount() != null ? s.getAccount().getUsername() : "N/A",
                        s.getStatus() != null ? s.getStatus().name() : "ACTIVE"
                ))
                .toList();
    }

    @Transactional
    public String createStaffAccount(RegisterRequest req) {

        if (accountRepository.existsByUsername(req.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        Account acc = new Account();
        acc.setUsername(req.username());
        acc.setPasswordHash(passwordEncoder.encode(req.password()));
        acc.setRole(AccountRole.STAFF);
        acc.setStatus(AccountStatus.ACTIVE);

        accountRepository.save(acc);

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

        StaffStatus newStatus =
                staff.getStatus() == StaffStatus.ACTIVE ? StaffStatus.INACTIVE : StaffStatus.ACTIVE;

        staff.setStatus(newStatus);

        if (staff.getAccount() != null) {

            staff.getAccount().setStatus(
                    newStatus == StaffStatus.ACTIVE
                            ? AccountStatus.ACTIVE
                            : AccountStatus.LOCKED
            );
        }

        staffRepository.save(staff);
    }

    /*
     ===============================
     CUSTOMER MANAGEMENT
     ===============================
     */

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(this::mapToCustomerResponse)
                .toList();
    }

    @Transactional
    public void toggleCustomerStatus(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Account acc = customer.getAccount();

        if (acc == null) {
            throw new RuntimeException("Khách hàng không có tài khoản đăng nhập");
        }

        AccountStatus currentStatus = acc.getStatus();

        if (currentStatus == null || currentStatus == AccountStatus.ACTIVE) {
            acc.setStatus(AccountStatus.LOCKED);
        } else {
            acc.setStatus(AccountStatus.ACTIVE);
        }

        accountRepository.save(acc);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomersByStaff(Long staffId) {

        return customerRepository.findCustomersByStaffId(staffId)
                .stream()
                .map(this::mapToCustomerResponse)
                .toList();
    }

    /*
     ===============================
     CUSTOMER DETAIL
     ===============================
     */

    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerDetail(Long customerId, CustomUserDetails currentUser) {

        Customer c = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không thấy khách này"));

        List<Booking> allBookings =
                bookingRepository.findByCustomerCustomerId(customerId);

        if (currentUser.getRole().equals("STAFF")) {

            allBookings = allBookings.stream()
                    .filter(b -> b.getStaff() != null
                            && b.getStaff().getStaffId().equals(currentUser.getStaffId()))
                    .toList();

            if (allBookings.isEmpty()) {
                throw new RuntimeException("Bạn không có quyền xem khách này!");
            }
        }

        BigDecimal totalSpent = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CustomerDetailResponse(
                mapToCustomerResponse(c),
                allBookings.stream().map(this::mapToBookingResponse).toList(),
                totalSpent
        );
    }

    /*
     ===============================
     HELPER MAPPING
     ===============================
     */

    private CustomerResponse mapToCustomerResponse(Customer c) {
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
                level,
                c.getAccount() != null
                        ? c.getAccount().getStatus().name()
                        : AccountStatus.ACTIVE.name()
        );
    }

    private BookingResponse mapToBookingResponse(Booking b) {
        // Lấy tên Tour an toàn thông qua TourSchedule
        String tourName = "N/A";
        if (b.getTourSchedule() != null && b.getTourSchedule().getTour() != null) {
            tourName = b.getTourSchedule().getTour().getTourName();
        }

        return new BookingResponse(
                b.getBookingId(),
                tourName, // Lấy từ quan hệ bắc cầu
                b.getCustomer().getFullName(),
                b.getNumberOfPeople(),
                b.getTotalPrice(),
                b.getStatus().name(),
                b.getBookingDate()
        );
    }
}