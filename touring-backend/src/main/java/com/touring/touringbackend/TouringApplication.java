package com.touring.touringbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class TouringApplication {

    public static void main(String[] args) {

        SpringApplication.run(TouringApplication.class, args);

    }

}
