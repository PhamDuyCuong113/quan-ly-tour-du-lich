package com.touring.touringbackend.controller;

import com.touring.touringbackend.dto.promotion.PromotionRequest;
import com.touring.touringbackend.entity.Promotion;
import com.touring.touringbackend.entity.PromotionStatus;
import com.touring.touringbackend.repository.PromotionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor // Tự động inject PromotionRepository qua Constructor
public class PromotionController {

    private final PromotionRepository promotionRepository;

    /**
     * API tạo mã khuyến mãi mới (Chỉ dành cho ADMIN)
     */
    @PostMapping
    public ResponseEntity<String> create(@Valid @RequestBody PromotionRequest request) {
        // 1. Chuyển đổi dữ liệu từ DTO sang Entity
        Promotion promotion = new Promotion();
        promotion.setCode(request.code());
        promotion.setDiscountType(request.discountType());
        promotion.setDiscountValue(request.discountValue());
        promotion.setStartDate(request.startDate());
        promotion.setEndDate(request.endDate());
        promotion.setUsageLimit(request.usageLimit());

        // 2. Thiết lập các giá trị mặc định cho mã mới
        promotion.setCurrentUsage(0);
        promotion.setStatus(PromotionStatus.ACTIVE);

        // 3. Lưu vào Database
        promotionRepository.save(promotion);

        return ResponseEntity.ok("Tạo mã khuyến mãi thành công: " + request.code());
    }

    @GetMapping
    public ResponseEntity<List<Promotion>> getAll() {
        return ResponseEntity.ok(promotionRepository.findAllByOrderByPromotionIdDesc());
    }
}