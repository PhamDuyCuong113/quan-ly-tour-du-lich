package com.touring.touringbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "staff_assignment")
public class StaffAssignment {

    @EmbeddedId
    private StaffAssignmentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("staffId")
    @JoinColumn(name = "staff_id")
    @JsonIgnore
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("scheduleId")
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    private TourSchedule tourSchedule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StaffRole role;
}
