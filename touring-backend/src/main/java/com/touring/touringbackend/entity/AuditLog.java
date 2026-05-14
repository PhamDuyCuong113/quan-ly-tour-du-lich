package com.touring.touringbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    // Ai thực hiện hành động (có thể null nếu hệ thống tự log)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    @JsonIgnore
    private Account account;

    // Snapshot username để vẫn đọc được khi account bị xoá
    @Column(name = "username", length = 80)
    private String username;

    // Vai trò tại thời điểm thao tác (ADMIN, STAFF, CUSTOMER, SYSTEM)
    @Column(name = "role", length = 30)
    private String role;

    // Hành động: CREATE_BOOKING, CANCEL_BOOKING, UPDATE_TOUR,...
    @Column(nullable = false, length = 80)
    private String action;

    // Tên bảng/đối tượng bị tác động: booking, payment, tour,...
    @Column(name = "table_name", length = 60)
    private String tableName;

    // ID của entity bị tác động (nếu có)
    @Column(name = "entity_id")
    private Long entityId;

    // Mô tả ngắn gọn (vd: "Tạo tour 'Đà Nẵng 3N2Đ'")
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "ip_address", length = 60)
    private String ipAddress;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
