package com.touring.touringbackend.service;

import com.touring.touringbackend.dto.auth.LoginRequest;
import com.touring.touringbackend.dto.auth.RegisterRequest;
import com.touring.touringbackend.dto.auth.UserResponse;
import com.touring.touringbackend.entity.*;
import com.touring.touringbackend.repository.AccountRepository;
import com.touring.touringbackend.repository.CustomerRepository;
import com.touring.touringbackend.repository.LoyaltyPointRepository;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * XỬ LÝ ĐĂNG KÝ
     */
    @Transactional
    public String register(RegisterRequest request) {
        // 1. Kiểm tra tồn tại
        if (accountRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // 2. Lưu Account (BẮT BUỘC dùng passwordEncoder)
        Account account = new Account();
        account.setUsername(request.username());
        account.setPasswordHash(passwordEncoder.encode(request.password())); // FIX: Mã hóa mật khẩu
        account.setRole(AccountRole.CUSTOMER);
        account.setStatus(AccountStatus.ACTIVE);
        Account savedAccount = accountRepository.save(account);

        // 3. Lưu Customer
        Customer customer = new Customer();
        customer.setAccount(savedAccount);
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setAddress(request.address());
        customer.setCustomerType(CustomerType.NORMAL);
        customerRepository.save(customer);

        return "Đăng ký thành công khách hàng: " + savedAccount.getUsername();
    }

    /**
     * XỬ LÝ ĐĂNG NHẬP
     */
    public String login(LoginRequest request) {
        // 1. Xác thực bằng AuthenticationManager
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        // 2. Lấy thông tin user
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();

        // 3. Tạo Token
        return jwtUtil.generateToken(user);
    }

    private final LoyaltyPointRepository loyaltyPointRepository;

    public UserResponse getMyInfo(CustomUserDetails userDetails) {
        // 1. Lấy Account
        Account acc = accountRepository.findById(userDetails.getAccountId())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Customer cust = acc.getCustomer();

        // 2. Xử lý cho trường hợp không phải Customer (ví dụ ADMIN)
        if (cust == null) {
            return new UserResponse(
                    acc.getAccountId(),
                    acc.getUsername(),
                    "Administrator", // Tên mặc định cho Admin
                    null, null,
                    acc.getRole().name(),
                    null, 0, LoyaltyLevel.SILVER
            );
        }
        String customerTypeName = (cust.getCustomerType() != null)
                ? cust.getCustomerType().name()
                : "NORMAL";

        var loyalty = loyaltyPointRepository.findById(cust.getCustomerId())
                .orElse(new LoyaltyPoint(cust.getCustomerId(), cust, 0, LoyaltyLevel.SILVER));

        return new UserResponse(
                acc.getAccountId(),
                acc.getUsername(),
                cust.getFullName(),
                cust.getEmail(),
                cust.getPhone(),
                acc.getRole().name(),
                customerTypeName, // DÙNG BIẾN NÀY thay vì gọi trực tiếp cust.getCustomerType().name()
                loyalty.getTotalPoints(),
                loyalty.getLevel()
        );
    }
}