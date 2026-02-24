package com.touring.touringbackend.security;

import com.touring.touringbackend.entity.Account;
import com.touring.touringbackend.entity.Customer;
import com.touring.touringbackend.repository.AccountRepository;
import com.touring.touringbackend.repository.CustomerRepository;
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

    @Override
    public UserDetails loadUserByUsername(String username) {

        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy: " + username));

        // THÊM DÒNG NÀY ĐỂ KIỂM TRA:
        System.out.println("Username: " + username + " | Password trong DB: " + acc.getPasswordHash());

        Customer customer = customerRepository
                .findByAccountAccountId(acc.getAccountId())
                .orElse(null);

        return new CustomUserDetails(
                acc.getAccountId(),
                customer != null ? customer.getCustomerId() : null,
                acc.getUsername(),
                acc.getPasswordHash(),
                acc.getRole().name()
        );
    }

}
