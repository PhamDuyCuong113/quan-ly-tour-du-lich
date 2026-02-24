package com.touring.touringbackend.dto.promotion;

import com.touring.touringbackend.entity.DiscountType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PromotionRequest(
        @NotBlank(message = "Mã giảm giá không được để trống")
        String code,

        @NotNull(message = "Loại giảm giá không được để trống")
        DiscountType discountType,

        @NotNull(message = "Giá trị giảm không được để trống")
        @DecimalMin("0.0")
        BigDecimal discountValue,

        @NotNull(message = "Ngày bắt đầu không được để trống")
        LocalDate startDate,

        @NotNull(message = "Ngày kết thúc không được để trống")
        LocalDate endDate,

        @Min(value = 1, message = "Lượt dùng tối thiểu là 1")
        Integer usageLimit
) {}