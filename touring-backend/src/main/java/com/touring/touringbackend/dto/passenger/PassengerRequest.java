package com.touring.touringbackend.dto.passenger;

import java.time.LocalDate;

public record PassengerRequest (
        String fullName,
        String gender,      // MALE, FEMALE, OTHER
        LocalDate dateOfBirth,
        String idNumber     // Số CCCD hoặc Passport
){}
