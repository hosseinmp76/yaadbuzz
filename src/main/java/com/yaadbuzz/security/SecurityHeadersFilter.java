package com.yaadbuzz.security;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;

@Provider
public class SecurityHeadersFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        var headers = responseContext.getHeaders();
        headers.putSingle("X-Content-Type-Options", "nosniff");
        headers.putSingle("X-Frame-Options", "DENY");
        headers.putSingle("Referrer-Policy", "strict-origin-when-cross-origin");
        headers.putSingle("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        headers.putSingle("Cross-Origin-Opener-Policy", "same-origin");
        headers.putSingle("Cross-Origin-Resource-Policy", "same-origin");
        if (!headers.containsKey("Content-Security-Policy")) {
            headers.putSingle(
                    "Content-Security-Policy",
                    "default-src 'self'; "
                            + "base-uri 'self'; "
                            + "frame-ancestors 'none'; "
                            + "form-action 'self'; "
                            + "img-src 'self' data: https: blob:; "
                            + "font-src 'self' data: https://fonts.gstatic.com; "
                            + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                            + "script-src 'self' https://telegram.org; "
                            + "frame-src https://oauth.telegram.org; "
                            + "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.de.sentry.io wss: ws:;"
            );
        }
    }
}
