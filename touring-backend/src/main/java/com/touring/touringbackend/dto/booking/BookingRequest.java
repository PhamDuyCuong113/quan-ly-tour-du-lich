package com.touring.touringbackend.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public record BookingRequest(
        @NotNull(message = "Vui lòng chọn lịch trình tour")
        Long scheduleId,

        @NotNull(message = "Vui lòng nhập số lượng người")
        @Min(value = 1, message = "Số người tối thiểu là 1")
        Integer numberOfPeople,

        String promotionCode


) {}