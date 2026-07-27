package com.yaadbuzz.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class RateLimitService {

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @ConfigProperty(name = "yaadbuzz.rate-limit.auth.max", defaultValue = "20")
    int authMax;

    @ConfigProperty(name = "yaadbuzz.rate-limit.auth.window-seconds", defaultValue = "60")
    long authWindowSeconds;

    public boolean tryConsume(String key) {
        return tryConsume(key, authMax, Duration.ofSeconds(authWindowSeconds));
    }

    public boolean tryConsume(String key, int max, Duration window) {
        Instant now = Instant.now();
        Window w = windows.compute(key, (k, existing) -> {
            if (existing == null || existing.expiresAt.isBefore(now)) {
                return new Window(now.plus(window), new AtomicInteger(0));
            }
            return existing;
        });
        return w.count.incrementAndGet() <= max;
    }

    private record Window(Instant expiresAt, AtomicInteger count) {
    }
}
