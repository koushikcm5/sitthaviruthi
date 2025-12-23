package com.yoga.attendance.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter implements Filter {

    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 100;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String clientIp = getClientIP(httpRequest);
        String key = clientIp + ":" + System.currentTimeMillis() / 60000;
        
        RequestCounter counter = requestCounts.computeIfAbsent(key, k -> new RequestCounter());
        
        if (counter.increment() > MAX_REQUESTS_PER_MINUTE) {
            httpResponse.setStatus(429);
            httpResponse.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return;
        }
        
        cleanupOldEntries();
        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private void cleanupOldEntries() {
        long currentMinute = System.currentTimeMillis() / 60000;
        requestCounts.entrySet().removeIf(entry -> {
            String[] parts = entry.getKey().split(":");
            long entryMinute = Long.parseLong(parts[1]);
            return currentMinute - entryMinute > 5;
        });
    }

    private static class RequestCounter {
        private int count = 0;
        
        public synchronized int increment() {
            return ++count;
        }
    }
}
