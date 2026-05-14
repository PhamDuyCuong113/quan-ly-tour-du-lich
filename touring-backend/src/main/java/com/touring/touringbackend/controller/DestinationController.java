package com.touring.touringbackend.controller;

import com.touring.touringbackend.audit.Audited;
import com.touring.touringbackend.entity.Destination;
import com.touring.touringbackend.repository.DestinationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationRepository destinationRepository;

    /** Public: lấy điểm đến nổi bật (Home page). */
    @GetMapping("/featured")
    public List<Destination> featured() {
        return destinationRepository.findByFeaturedTrueOrderByDisplayOrderAscDestinationIdAsc();
    }

    /** Public: lấy toàn bộ điểm đến. */
    @GetMapping
    public List<Destination> all() {
        return destinationRepository.findAllByOrderByDisplayOrderAscDestinationIdAsc();
    }

    @GetMapping("/{id}")
    public Destination get(@PathVariable Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Destination not found: " + id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Audited(action = "CREATE_DESTINATION", tableName = "destination",
            description = "Tạo điểm đến mới")
    public ResponseEntity<Destination> create(@RequestBody Destination body) {
        body.setDestinationId(null);
        Destination saved = destinationRepository.save(body);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Audited(action = "UPDATE_DESTINATION", tableName = "destination",
            description = "Cập nhật điểm đến")
    public Destination update(@PathVariable Long id, @RequestBody Destination body) {
        Destination existing = destinationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Destination not found: " + id));
        existing.setName(body.getName());
        existing.setRegion(body.getRegion());
        existing.setImageUrl(body.getImageUrl());
        existing.setDescription(body.getDescription());
        existing.setFeatured(body.getFeatured() == null ? Boolean.TRUE : body.getFeatured());
        existing.setDisplayOrder(body.getDisplayOrder());
        return destinationRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Audited(action = "DELETE_DESTINATION", tableName = "destination",
            description = "Xoá điểm đến")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!destinationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        destinationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
