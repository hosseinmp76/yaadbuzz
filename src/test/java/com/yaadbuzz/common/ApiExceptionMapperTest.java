package com.yaadbuzz.common;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.ws.rs.core.Response;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ApiExceptionMapperTest {

    private final ApiExceptionMapper mapper = new ApiExceptionMapper();

    @Test
    void mapsStatusAndMessage() {
        Response response = mapper.toResponse(ApiException.forbidden("nope"));

        assertEquals(403, response.getStatus());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getEntity();
        assertEquals("nope", body.get("message"));
    }
}
