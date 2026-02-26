package com.touring.touringbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/*
staff_id (PK)
account_id (FK → Account)
full_name, phone, email
position (SALE / OPERATOR / GUIDE)
status (ACTIVE / INACTIVE)
* */

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "account_id")
    @JsonIgnore
    private Account account;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;
    private String email;

    @Enumerated(EnumType.STRING)
    private StaffPosition position;

    @Enumerated(EnumType.STRING)
    private StaffStatus status;


}
