package com.yaadbuzz.auth;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.yaadbuzz.common.ApiException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TelegramLoginVerifierTest {

    private static final String BOT_TOKEN = "123456:ABC-DEF";

    private TelegramLoginVerifier verifier;

    @BeforeEach
    void setUp() {
        verifier = new TelegramLoginVerifier();
        verifier.botToken = BOT_TOKEN;
    }

    @Test
    void acceptsValidSignature() throws Exception {
        long authDate = Instant.now().getEpochSecond();
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("id", "42");
        fields.put("first_name", "Ada");
        fields.put("username", "ada");
        fields.put("auth_date", Long.toString(authDate));
        fields.put("hash", sign(fields));

        assertDoesNotThrow(() -> verifier.verify(fields));
    }

    @Test
    void rejectsTamperedPayload() throws Exception {
        long authDate = Instant.now().getEpochSecond();
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("id", "42");
        fields.put("first_name", "Ada");
        fields.put("auth_date", Long.toString(authDate));
        fields.put("hash", sign(fields));
        fields.put("first_name", "Eve");

        assertThrows(ApiException.class, () -> verifier.verify(fields));
    }

    private static String sign(Map<String, String> fields) throws Exception {
        String dataCheck = fields.entrySet().stream()
                .filter(e -> !"hash".equals(e.getKey()))
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .reduce((a, b) -> a + "\n" + b)
                .orElse("");
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte[] secret = sha256.digest(BOT_TOKEN.getBytes(StandardCharsets.UTF_8));
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(dataCheck.getBytes(StandardCharsets.UTF_8)));
    }
}
