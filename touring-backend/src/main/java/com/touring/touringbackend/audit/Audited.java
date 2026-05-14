package com.touring.touringbackend.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Đánh dấu một method (controller hoặc service) cần được ghi lại Audit Log.
 *
 * Ví dụ:
 *   @Audited(action = "CREATE_TOUR", tableName = "tour", description = "Tạo tour mới")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {

    /** Mã hành động, ví dụ CREATE_TOUR, UPDATE_BOOKING, DELETE_VOUCHER */
    String action();

    /** Tên bảng/đối tượng bị tác động: tour, booking, customer,... */
    String tableName() default "";

    /** Mô tả ngắn gọn cho người đọc log */
    String description() default "";
}
