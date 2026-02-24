package com.touring.touringbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tour_schedule")
public class TourSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    /* =====================
       QUAN HỆ
       ===================== */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    @JsonIgnore
    private Tour tour;

    /* =====================
       THÔNG TIN LỊCH
       ===================== */

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "max_slots")
    private Integer maxSlots;

    @Column(name = "available_slots")
    private Integer availableSlots;

    @Column(
            precision = 12,
            scale = 2
    )
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TourScheduleStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /* =====================
       QUAN HỆ NGƯỢC
       ===================== */

    @OneToMany(mappedBy = "tourSchedule", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "tourSchedule", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<StaffAssignment> staffAssignments;

    /* =====================
       LIFECYCLE
       ===================== */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TourScheduleStatus.OPEN;
        }
    }
}
