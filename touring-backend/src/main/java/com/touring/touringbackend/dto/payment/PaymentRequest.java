package com.touring.touringbackend.dto.payment;

import java.math.BigDecimal;

public record PaymentRequest(
        String paymentMethod, // CASH, BANK, ONLINE
        BigDecimal amount
) {}