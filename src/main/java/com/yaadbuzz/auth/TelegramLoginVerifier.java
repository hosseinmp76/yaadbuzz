package com.yaadbuzz.auth;

import com.yaadbuzz.common.ApiException;
import jakarta.enterprise.context.ApplicationScoped;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Verifies Telegram Login Widget payloads per
 * https://core.telegram.org/widgets/login
 */
@ApplicationScoped
public class TelegramLoginVerifier {

    /** Reject auth payloads older than this (seconds). */
    private static final long MAX_AUTH_AGE_SECONDS = 600;

    @ConfigProperty(name = "yaadbuzz.oauth.telegram.bot-token", defaultValue = "")
    String botToken;

    public void verify(Map<String, String> fields) {
        if (botToken == null || botToken.isBlank()) {
            throw ApiException.badRequest("Telegram login is not configured");
        }
        String hash = fields.get("hash");
        String id = fields.get("id");
        String authDateRaw = fields.get("auth_date");
        if (hash == null || hash.isBlank() || id == null || id.isBlank() || authDateRaw == null) {
            throw ApiException.unauthorized("Invalid Telegram login payload");
        }

        long authDate;
        try {
            authDate = Long.parseLong(authDateRaw);
        } catch (NumberFormatException e) {
            throw ApiException.unauthorized("Invalid Telegram auth_date");
        }
        long now = Instant.now().getEpochSecond();
        if (authDate > now + 60 || now - authDate > MAX_AUTH_AGE_SECONDS) {
            throw ApiException.unauthorized("Telegram login expired; try again");
        }

        TreeMap<String, String> sorted = new TreeMap<>();
        for (Map.Entry<String, String> e : fields.entrySet()) {
            if (e.getKey() == null || "hash".equals(e.getKey())) {
                continue;
            }
            if (e.getValue() == null || e.getValue().isBlank()) {
                continue;
            }
            sorted.put(e.getKey(), e.getValue());
        }
        List<String> lines = new ArrayList<>(sorted.size());
        for (Map.Entry<String, String> e : sorted.entrySet()) {
            lines.add(e.getKey() + "=" + e.getValue());
        }
        String dataCheckString = String.join("\n", lines);

        byte[] expected;
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] secretKey = sha256.digest(botToken.getBytes(StandardCharsets.UTF_8));
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            expected = mac.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw ApiException.unauthorized("Telegram login verification failed");
        }

        byte[] provided;
        try {
            provided = HexFormat.of().parseHex(hash.toLowerCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw ApiException.unauthorized("Invalid Telegram login hash");
        }
        if (!MessageDigest.isEqual(expected, provided)) {
            throw ApiException.unauthorized("Telegram login signature mismatch");
        }
    }

    public static String syntheticEmail(String telegramUserId) {
        return telegramUserId + "@users.noreply.telegram.org";
    }

    public static String displayName(String firstName, String lastName, String username, String id) {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isBlank()) {
            sb.append(firstName.trim());
        }
        if (lastName != null && !lastName.isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(' ');
            }
            sb.append(lastName.trim());
        }
        if (!sb.isEmpty()) {
            return sb.toString();
        }
        if (username != null && !username.isBlank()) {
            return username.trim();
        }
        return "Telegram " + id;
    }
}
