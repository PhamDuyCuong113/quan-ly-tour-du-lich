package com.touring.touringbackend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 4, max = 50)
    String username,

    @NotBlank @Size(min = 6)
    String password,

    @NotBlank
    String fullName,

    @Email
    String email,

    @NotBlank
    String phone,

    String address
){}
