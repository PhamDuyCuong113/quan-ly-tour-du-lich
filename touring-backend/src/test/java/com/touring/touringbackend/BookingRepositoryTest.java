//package com.touring.touringbackend;
//
//import com.touring.touringbackend.entity.*;
//import com.touring.touringbackend.repository.BookingRepository;
//import com.touring.touringbackend.repository.CustomerRepository;
//import com.touring.touringbackend.repository.TourRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.time.LocalDateTime;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//@SpringBootTest
//class BookingRepositoryTest {
//
//    @Autowired BookingRepository bookingRepository;
//    @Autowired CustomerRepository customerRepository;
//    @Autowired TourRepository tourRepository;
//
//    @Test
//    void should_save_booking() {
//        // 1) tạo customer
//        Customer c = new Customer();
//        c.setFullName("Test Customer");
//        c.setPhone("0900000001");
//        c.setEmail("test1@gmail.com");
//        c = customerRepository.save(c);
//
//        // 2) tạo tour
//        Tour t = new Tour();
//        t.setName("Tour Ha Long");
//        t.setPrice(1500000.0);
//        t = tourRepository.save(t);
//
//        // 3) tạo booking
//        Booking b = new Booking();
//        b.setCustomer(c);
//        b.setTour(t);
//        b.setBookingDate(LocalDateTime.now());
//        b.setNumberOfPeople(2);
//        b.setTotalPrice(t.getPrice() * 2);
//        b.setStatus(BookingStatus.PENDING);
//
//        Booking saved = bookingRepository.save(b);
//
//        assertThat(saved.getId()).isNotNull();
//    }
//}
