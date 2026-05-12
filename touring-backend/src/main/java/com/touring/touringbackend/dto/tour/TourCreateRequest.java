package com.touring.touringbackend.dto.tour;

import com.touring.touringbackend.entity.TourType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record TourCreateRequest(
        @NotBlank(message = "Mã tour không được để trống")
        String tourCode,

        @NotBlank(message = "Tên tour không được để trống")
        String tourName,

        @NotBlank(message = "Điểm đến không được để trống")
        String destination,

        @NotNull(message = "Loại tour không được để trống")
        TourType tourType,

        @Min(1)
        Integer durationDays,

        @DecimalMin("0.0")
        BigDecimal basePrice,

        String description,
        
        String accommodation,
        String departureFrom,
        String transport,
        Boolean isFeatured,
        String highlights,
        String inclusions,
        String exclusions,
        String terms
) {}