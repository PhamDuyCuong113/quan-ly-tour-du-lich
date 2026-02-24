package com.touring.touringbackend.controller;


import com.touring.touringbackend.dto.passenger.PassengerRequest;
import com.touring.touringbackend.security.CustomUserDetails;
import com.touring.touringbackend.service.PassengerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.touring.touringbackend.service.PassengerService;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class PassengerController {
    // Trong BookingController.java
    private final PassengerService passengerService;

    @PostMapping("/{id}/passengers")
    public ResponseEntity<String> addPassengers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody List<PassengerRequest> requests) {

        String message = passengerService.addPassenger(id, userDetails.getCustomerId(), requests);
        return ResponseEntity.ok(message);
    }
}
