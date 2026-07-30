package com.yaadbuzz.auth;

import jakarta.enterprise.context.ApplicationScoped;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Short-lived one-time codes that bridge OIDC browser login to SPA localStorage tokens.
 */
@ApplicationScoped
public class OAuthCodeStore {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long TTL_SECONDS = 90;

    private final ConcurrentHashMap<String, Entry> codes = new ConcurrentHashMap<>();

    public String put(AuthService.AuthTokens tokens) {
        purgeExpired();
        String code = generate();
        codes.put(code, new Entry(tokens, Instant.now().plusSeconds(TTL_SECONDS)));
        return code;
    }

    public AuthService.AuthTokens take(String code) {
        purgeExpired();
        if (code == null || code.isBlank()) {
            return null;
        }
        Entry entry = codes.remove(code.trim());
        if (entry == null || entry.expires().isBefore(Instant.now())) {
            return null;
        }
        return entry.tokens();
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        Iterator<Map.Entry<String, Entry>> it = codes.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue().expires().isBefore(now)) {
                it.remove();
            }
        }
    }

    private static String generate() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private record Entry(AuthService.AuthTokens tokens, Instant expires) {
    }
}
