package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
}
