package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Itinerary i WHERE i.tour.tourId = :tourId")
    void forceDeleteByTourId(@Param("tourId") Long tourId);
}