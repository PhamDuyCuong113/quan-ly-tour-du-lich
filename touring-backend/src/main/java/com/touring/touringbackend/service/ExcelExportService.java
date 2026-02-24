package com.touring.touringbackend.service;

import com.touring.touringbackend.entity.Booking;
import com.touring.touringbackend.entity.Passenger;
import com.touring.touringbackend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final BookingRepository bookingRepository;

    public byte[] exportPassengersToExcel(Long scheduleId) throws IOException {
        // 1. Lấy tất cả các Booking của lịch trình này
        List<Booking> bookings = bookingRepository.findByTourScheduleScheduleId(scheduleId);

        // 2. Tạo file Excel trong bộ nhớ
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Danh sách hành khách");

            // --- Tạo Header ---
            Row headerRow = sheet.createRow(0);
            String[] columns = {"STT", "Họ Tên", "Giới Tính", "Ngày Sinh", "Số CCCD", "Mã Đơn"};

            // Định dạng cho Header (Chữ đậm)
            CellStyle headerStyle = workbook.createCellStyle(); // Sửa từ createStyle() thành createCellStyle()
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- Đổ dữ liệu hành khách ---
            int rowIdx = 1;
            int stt = 1;
            for (Booking b : bookings) {
                // Kiểm tra nếu đơn hàng có danh sách hành khách
                if (b.getPassengers() != null) {
                    for (Passenger p : b.getPassengers()) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(stt++);
                        row.createCell(1).setCellValue(p.getFullName());
                        row.createCell(2).setCellValue(p.getGender().name());
                        row.createCell(3).setCellValue(p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : "");
                        row.createCell(4).setCellValue(p.getIdNumber());
                        row.createCell(5).setCellValue("#" + b.getBookingId());
                    }
                }
            }

            // Tự động căn chỉnh độ rộng cột
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}