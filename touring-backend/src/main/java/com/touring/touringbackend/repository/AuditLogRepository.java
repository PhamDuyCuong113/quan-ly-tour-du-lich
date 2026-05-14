package com.touring.touringbackend.repository;

import com.touring.touringbackend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:keyword IS NULL OR :keyword = ''
                    OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(a.action) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:tableName IS NULL OR :tableName = '' OR a.tableName = :tableName)
              AND (:role IS NULL OR :role = '' OR a.role = :role)
              AND (:fromDate IS NULL OR a.createdAt >= :fromDate)
              AND (:toDate IS NULL OR a.createdAt <= :toDate)
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> search(@Param("keyword") String keyword,
                          @Param("tableName") String tableName,
                          @Param("role") String role,
                          @Param("fromDate") LocalDateTime fromDate,
                          @Param("toDate") LocalDateTime toDate,
                          Pageable pageable);
}
