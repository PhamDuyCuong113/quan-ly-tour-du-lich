package com.touring.touringbackend.dto.review;

import jakarta.validation.constraints.*;

public record ReviewRequest(
        @NotNull Long bookingId,
        @Min(1) @Max(5) Integer rating,
        @NotBlank String comment
) {}