package com.touring.touringbackend.audit;

import com.touring.touringbackend.entity.Account;
import com.touring.touringbackend.entity.AuditLog;
import com.touring.touringbackend.repository.AccountRepository;
import com.touring.touringbackend.repository.AuditLogRepository;
import com.touring.touringbackend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AccountRepository accountRepository;

    /**
     * Ghi 1 dòng audit log. Tự động lấy người dùng hiện tại từ SecurityContext.
     * Dùng REQUIRES_NEW để log vẫn được ghi kể cả khi transaction nghiệp vụ rollback.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String tableName, Long entityId, String description) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = "system";
            String role = "SYSTEM";
            Account account = null;

            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                Object principal = auth.getPrincipal();
                if (principal instanceof CustomUserDetails u) {
                    username = u.getUsername();
                    role = u.getRole();
                    if (u.getAccountId() != null) {
                        account = accountRepository.findById(u.getAccountId()).orElse(null);
                    }
                } else {
                    username = auth.getName();
                }
            }

            AuditLog entry = AuditLog.builder()
                    .account(account)
                    .username(username)
                    .role(role)
                    .action(action)
                    .tableName(tableName)
                    .entityId(entityId)
                    .description(description)
                    .ipAddress(extractIp())
                    .build();

            auditLogRepository.save(entry);
        } catch (Exception ex) {
            // Không bao giờ để audit làm hỏng nghiệp vụ
            log.warn("Failed to write audit log: {}", ex.getMessage());
        }
    }

    private String extractIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest req = attrs.getRequest();
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
            return req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}
