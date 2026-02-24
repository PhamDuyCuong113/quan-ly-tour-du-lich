package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.payment.PaymentRequest;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{id}/payments")
    public ResponseEntity<String> pay(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody PaymentRequest request) {

        String result = paymentService.processPayment(id, userDetails.getCustomerId(), request);
        return ResponseEntity.ok(result);
    }


}