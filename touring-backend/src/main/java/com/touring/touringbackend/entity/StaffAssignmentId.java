package com.touring.touringbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StaffAssignmentId implements Serializable {

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "schedule_id")
    private Long scheduleId;
}
