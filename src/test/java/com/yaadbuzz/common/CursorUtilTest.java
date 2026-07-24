package com.yaadbuzz.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class CursorUtilTest {

    @Test
    void roundTripPreservesInstantAndId() {
        Instant now = Instant.parse("2026-07-24T10:00:00Z");
        UUID id = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

        String encoded = CursorUtil.encode(now, id);
        CursorUtil.Cursor decoded = CursorUtil.decode(encoded);

        assertEquals(now, decoded.createdAt());
        assertEquals(id, decoded.id());
    }

    @Test
    void decodeBlankReturnsNull() {
        assertNull(CursorUtil.decode(null));
        assertNull(CursorUtil.decode(""));
        assertNull(CursorUtil.decode("   "));
    }

    @Test
    void decodeInvalidCursorThrowsBadRequest() {
        ApiException ex = assertThrows(ApiException.class, () -> CursorUtil.decode("not-a-cursor"));
        assertEquals(400, ex.status);
    }
}
