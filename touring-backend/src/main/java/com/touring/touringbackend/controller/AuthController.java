package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.auth.ChangePasswordRequest;
import com.touring.touringbackend.dto.auth.LoginRequest;
import com.touring.touringbackend.dto.auth.LoginResponse;
import com.touring.touringbackend.dto.auth.RegisterRequest;
import com.touring.touringbackend.dto.auth.UserResponse;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.security.JwtUtil;
import com.touring.touringbackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        // 1️⃣ Xác thực username + password
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.username(),
                                request.password()
                        )
                );

        // 2️⃣ Lấy user sau khi authenticate thành công
        CustomUserDetails user =
                (CustomUserDetails) authentication.getPrincipal();

        // 3️⃣ Tạo token
        String token = jwtUtil.generateToken(
            user.getAccountId(),
            user.getCustomerId(),
            user.getStaffId(),
            user.getUsername(),
            user.getRole()
        );

        // 4️⃣ Trả token
        return new LoginResponse(token);
    }
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request){
        String message = authService.register(request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getMyInfo(userDetails));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.changePassword(userDetails, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}
