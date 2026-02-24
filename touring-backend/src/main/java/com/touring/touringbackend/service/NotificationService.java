package com.touring.touringbackend.service;

import com.touring.touringbackend.entity.Account;
import com.touring.touringbackend.entity.Notification;
import com.touring.touringbackend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional
    public void send(Account account, String title, String content) {
        Notification notification = new Notification();
        notification.setAccount(account);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
}
