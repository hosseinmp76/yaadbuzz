package com.yaadbuzz;

import com.yaadbuzz.common.CursorUtil;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class CursorUtilTest {

    @Test
    void roundTrip() {
        Instant now = Instant.parse("2026-07-24T10:00:00Z");
        UUID id = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        String encoded = CursorUtil.encode(now, id);
        CursorUtil.Cursor decoded = CursorUtil.decode(encoded);
        Assertions.assertEquals(now, decoded.createdAt());
        Assertions.assertEquals(id, decoded.id());
    }
}
