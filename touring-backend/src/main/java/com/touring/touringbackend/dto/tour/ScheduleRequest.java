package com.touring.touringbackend.dto.tour;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ScheduleRequest(
        @NotNull(message = "Ngày đi không được để trống")
        @Future(message = "Ngày đi phải ở tương lai")
        LocalDate departureDate,

        @NotNull(message = "Ngày về không được để trống")
        @Future(message = "Ngày về phải ở tương lai")
        LocalDate returnDate,

        @NotNull(message = "Số chỗ không được để trống")
        @Min(value = 1, message = "Tối thiểu phải có 1 chỗ")
        Integer maxSlots,

        @NotNull(message = "Giá tour không được để trống")
        @Min(value = 0, message = "Giá không được âm")
        BigDecimal price
) {}