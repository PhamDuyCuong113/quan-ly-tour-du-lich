package com.touring.touringbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    public void sendBookingConfirmation(String toEmail, String customerName, String tourName, String totalPrice) {
        org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Xác nhận đặt tour thành công - Touring App");
        message.setText("Chào " + customerName + ",\n\n" +
                "Bạn đã thanh toán thành công cho tour: " + tourName + ".\n" +
                "Tổng tiền: " + totalPrice + " VNĐ.\n" +
                "Chúc bạn có một chuyến đi vui vẻ!");
        mailSender.send(message);
    }
}
