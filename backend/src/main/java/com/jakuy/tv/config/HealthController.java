package com.jakuy.tv.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight liveness endpoint used to keep the free-tier backend warm. It does
 * not touch the database, so an external uptime pinger can hit it cheaply (and it
 * works even before any channels have been imported) to prevent the instance from
 * spinning down and forcing a slow cold start on the next real visitor.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
