package com.yaadbuzz.auth;

import io.quarkus.oidc.runtime.OidcUtils;
import io.quarkus.oidc.TenantResolver;
import io.vertx.ext.web.RoutingContext;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Resolves OIDC tenant from {@code /api/auth/oauth/{google|github|telegram}} path segments.
 * Returns null for all other routes so JWT remains the API auth mechanism.
 */
@ApplicationScoped
public class OAuthTenantResolver implements TenantResolver {

    @Override
    public String resolve(RoutingContext context) {
        String existing = context.get(OidcUtils.TENANT_ID_ATTRIBUTE);
        if (existing != null && !existing.isBlank()) {
            return existing;
        }
        String path = context.request().path();
        if (path == null) {
            return null;
        }
        if (path.contains("/api/auth/oauth/google")) {
            return "google";
        }
        if (path.contains("/api/auth/oauth/github")) {
            return "github";
        }
        if (path.contains("/api/auth/oauth/telegram")) {
            return "telegram";
        }
        return null;
    }
}
