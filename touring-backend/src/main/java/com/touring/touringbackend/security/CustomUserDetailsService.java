package com.touring.touringbackend.security;

import com.touring.touringbackend.entity.Account;
import com.touring.touringbackend.entity.Customer;
import com.touring.touringbackend.entity.Staff;
import com.touring.touringbackend.repository.AccountRepository;
import com.touring.touringbackend.repository.CustomerRepository;
import com.touring.touringbackend.repository.StaffRepository; // Thêm repo này
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository; // Inject thêm StaffRepository

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Tìm tài khoản
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + username));

        Long customerId = null;
        Long staffId = null;

        // 2. Phân loại để lấy ID tương ứng
        // Nếu là khách hàng -> lấy customerId
        if (acc.getRole().name().equals("CUSTOMER")) {
            customerId = customerRepository.findByAccountAccountId(acc.getAccountId())
                    .map(Customer::getCustomerId)
                    .orElse(null);
        }
        // Nếu là STAFF hoặc ADMIN -> lấy staffId (vì Admin cũng thường có bản ghi Staff để quản lý)
        else {
            staffId = staffRepository.findByAccountAccountId(acc.getAccountId())
                    .map(Staff::getStaffId) // Giả sử trong Staff entity bạn đặt id là Long id
                    .orElse(null);
        }

        // Log kiểm tra (Xóa khi deploy)
        System.out.println("Login: " + username + " | Role: " + acc.getRole() + " | CustomerID: " + customerId + " | StaffID: " + staffId);

        // 3. Trả về đối tượng User đầy đủ thông tin
        return new CustomUserDetails(
                acc.getAccountId(),
                customerId,
                staffId, // Trường mới thêm
                acc.getUsername(),
                acc.getPasswordHash(),
                acc.getRole().name()
        );
    }
}