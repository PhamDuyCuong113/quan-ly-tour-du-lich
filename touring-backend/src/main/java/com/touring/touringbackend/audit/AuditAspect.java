package com.touring.touringbackend.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Aspect tự động ghi Audit Log cho các method có @Audited.
 * Chỉ ghi khi method chạy thành công (không ném exception).
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogService auditLogService;

    @Around("@annotation(com.touring.touringbackend.audit.Audited)")
    public Object aroundAudited(ProceedingJoinPoint pjp) throws Throwable {
        Object result = pjp.proceed();

        try {
            MethodSignature sig = (MethodSignature) pjp.getSignature();
            Method method = sig.getMethod();
            Audited a = method.getAnnotation(Audited.class);
            if (a != null) {
                Long entityId = tryExtractId(result, pjp.getArgs());
                auditLogService.log(a.action(), a.tableName(), entityId, a.description());
            }
        } catch (Exception ex) {
            log.warn("AuditAspect failed: {}", ex.getMessage());
        }
        return result;
    }

    /** Cố gắng lấy id từ kết quả trả về hoặc tham số đầu tiên kiểu Long/Integer. */
    private Long tryExtractId(Object result, Object[] args) {
        Long id = readId(result);
        if (id != null) return id;
        if (args != null) {
            for (Object arg : args) {
                Long candidate = readId(arg);
                if (candidate != null) return candidate;
            }
        }
        return null;
    }

    private Long readId(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Long l) return l;
        if (obj instanceof Integer i) return i.longValue();
        try {
            // Thử các getter thường gặp
            for (String name : new String[]{"getId", "getTourId", "getBookingId", "getCustomerId",
                    "getStaffId", "getDestinationId", "getPromotionId", "getVoucherId", "getAccountId"}) {
                try {
                    Method m = obj.getClass().getMethod(name);
                    Object v = m.invoke(obj);
                    if (v instanceof Long l) return l;
                    if (v instanceof Integer i) return i.longValue();
                } catch (NoSuchMethodException ignore) {
                    // continue
                }
            }
            // ResponseEntity?
            try {
                Method body = obj.getClass().getMethod("getBody");
                Object inner = body.invoke(obj);
                if (inner != null && inner != obj) return readId(inner);
            } catch (NoSuchMethodException ignore) {
                // ignore
            }
        } catch (Exception ignore) {
            // ignore
        }
        return null;
    }
}
