package com.touring.touringbackend.controller;

import com.touring.touringbackend.entity.Notification;
import com.touring.touringbackend.repository.NotificationRepository;
import com.touring.touringbackend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    /**
     * Lấy danh sách thông báo của tôi (người đang đăng nhập)
     */
    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                notificationRepository.findByAccountAccountIdOrderByCreatedAtDesc(userDetails.getAccountId())
        );
    }
}