package com.touring.touringbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tour")
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tour_id")
    private Long tourId;

    @Column(name = "tour_code", unique = true, length = 30)
    private String tourCode;

    @Column(name = "tour_name", nullable = false, length = 150)
    private String tourName;

    @Column(length = 100)
    private String destination;

    @Enumerated(EnumType.STRING)
    @Column(name = "tour_type", length = 20)
    private TourType tourType;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(
            name = "base_price",
            precision = 12,
            scale = 2
    )
    private BigDecimal basePrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "thumbnail_pid")
    private String thumbnailPid;

    @Column(length = 180)
    private String accommodation;

    @Column(name = "departure_from", length = 120)
    private String departureFrom;

    @Column(length = 120)
    private String transport;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(columnDefinition = "TEXT")
    private String highlights;

    @Column(columnDefinition = "TEXT")
    private String inclusions;

    @Column(columnDefinition = "TEXT")
    private String exclusions;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TourStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /* =====================
       QUAN HỆ
       ===================== */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    @JsonIgnore
    private Staff staff;

    @OneToMany(mappedBy = "tour", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TourSchedule> schedules;

    @OneToMany(mappedBy = "tour", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Itinerary> itineraries;

    @OneToMany(mappedBy = "tour", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TourImage> images;

    /* =====================
       LIFECYCLE
       ===================== */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TourStatus.OPEN;
        }
    }

    @Column(name = "is_deleted")
    private boolean isDeleted = false; // Mặc định là false
}
