package com.touring.touringbackend.dto.audit;

import com.touring.touringbackend.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long logId;
    private String username;
    private String role;
    private String action;
    private String tableName;
    private Long entityId;
    private String description;
    private String ipAddress;
    private LocalDateTime createdAt;

    public static AuditLogResponse from(AuditLog a) {
        return AuditLogResponse.builder()
                .logId(a.getLogId())
                .username(a.getUsername())
                .role(a.getRole())
                .action(a.getAction())
                .tableName(a.getTableName())
                .entityId(a.getEntityId())
                .description(a.getDescription())
                .ipAddress(a.getIpAddress())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
