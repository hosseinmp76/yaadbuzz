package com.yaadbuzz.security;

import com.yaadbuzz.common.ApiException;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import java.util.Set;

@Provider
@Priority(Priorities.AUTHENTICATION - 20)
public class AuthRateLimitFilter implements ContainerRequestFilter {

    private static final Set<String> LIMITED = Set.of(
            "api/auth/login",
            "api/auth/register",
            "api/auth/forgot-password",
            "api/auth/reset-password",
            "api/auth/refresh",
            "api/auth/change-password",
            "api/auth/oauth/telegram"
    );

    @Inject
    RateLimitService rateLimitService;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        String path = requestContext.getUriInfo().getPath();
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (!LIMITED.contains(path)) {
            return;
        }
        String ip = clientIp(requestContext);
        if (!rateLimitService.tryConsume(ip + "|" + path)) {
            throw ApiException.tooManyRequests("Too many requests. Please try again shortly.");
        }
    }

    private String clientIp(ContainerRequestContext ctx) {
        String forwarded = ctx.getHeaderString("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String real = ctx.getHeaderString("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        return "unknown";
    }
}
