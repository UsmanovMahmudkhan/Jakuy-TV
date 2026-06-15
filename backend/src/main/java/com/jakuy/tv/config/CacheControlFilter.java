package com.jakuy.tv.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds caching headers to the public, read-only channel endpoints so CDNs,
 * browsers, and the Next.js data cache can serve them without round-tripping to
 * the (free-tier, cold-start-prone) backend on every request. Per-user
 * endpoints such as /api/favorites are intentionally left uncached.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CacheControlFilter extends OncePerRequestFilter {

    private static final String CACHE_HEADER =
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (HttpMethod.GET.matches(request.getMethod())) {
            String path = request.getRequestURI();
            if (path != null && path.startsWith("/api/channels")) {
                response.setHeader(HttpHeaders.CACHE_CONTROL, CACHE_HEADER);
            }
        }
        chain.doFilter(request, response);
    }
}
