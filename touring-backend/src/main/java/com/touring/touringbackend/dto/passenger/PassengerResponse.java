package com.touring.touringbackend.dto.passenger;

import java.time.LocalDate;

public record PassengerResponse (
    String fullName,
    String gender,      // MALE, FEMALE, OTHER
    LocalDate dateOfBirth,
    String idNumber
){}
