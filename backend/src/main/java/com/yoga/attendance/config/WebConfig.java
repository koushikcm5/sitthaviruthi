package com.yoga.attendance.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = "file:uploads/";
        System.out.println("Configuring static resources with simple path: " + uploadPath);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
