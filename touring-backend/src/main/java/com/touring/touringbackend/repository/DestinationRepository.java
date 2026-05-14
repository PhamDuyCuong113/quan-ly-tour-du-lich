package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByFeaturedTrueOrderByDisplayOrderAscDestinationIdAsc();

    List<Destination> findAllByOrderByDisplayOrderAscDestinationIdAsc();
}
