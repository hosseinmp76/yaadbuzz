package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.OAuthCodeStore;
import com.yaadbuzz.auth.OidcCookieClearer;
import com.yaadbuzz.common.ApiException;
import io.quarkus.oidc.IdToken;
import io.quarkus.oidc.OidcSession;
import io.quarkus.oidc.UserInfo;
import io.quarkus.oidc.runtime.OidcUtils;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.Set;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

/**
 * OIDC-protected entrypoints. Visiting {@code /api/auth/oauth/{google|github|telegram}}
 * starts the provider login; after redirect back, issues a one-time code for the SPA.
 * <p>
 * Do not inject the access token as {@link JsonWebToken} (GitHub tokens are opaque).
 * Prefer {@link UserInfo} when present (GitHub/Google); fall back to {@link IdToken}
 * claims (Telegram has no UserInfo endpoint).
 */
@Path("/api/auth/oauth")
@Tag(name = "Auth")
@Authenticated
public class OAuthLoginResource {

    private static final Logger LOG = Logger.getLogger(OAuthLoginResource.class);
    private static final Set<String> PROVIDERS = Set.of("google", "github", "telegram");

    @Inject
    AuthService authService;

    @Inject
    OAuthCodeStore oAuthCodeStore;

    @Inject
    @IdToken
    JsonWebToken idToken;

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    OidcSession oidcSession;

    @Inject
    OidcCookieClearer oidcCookieClearer;

    @ConfigProperty(name = "yaadbuzz.public-url")
    String publicUrl;

    @ConfigProperty(name = "yaadbuzz.oauth.google.enabled", defaultValue = "false")
    boolean googleEnabled;

    @ConfigProperty(name = "yaadbuzz.oauth.github.enabled", defaultValue = "false")
    boolean githubEnabled;

    @ConfigProperty(name = "yaadbuzz.oauth.telegram.enabled", defaultValue = "false")
    boolean telegramEnabled;

    @GET
    @Path("/{provider}")
    @Operation(summary = "Start or finish OAuth login (Google / GitHub / Telegram)")
    public Response login(@PathParam("provider") String provider) {
        String normalized = provider == null ? "" : provider.trim().toLowerCase();
        if (!PROVIDERS.contains(normalized)) {
            throw ApiException.badRequest("Unsupported OAuth provider");
        }
        if ("google".equals(normalized) && !googleEnabled) {
            throw ApiException.badRequest("Google login is not configured");
        }
        if ("github".equals(normalized) && !githubEnabled) {
            throw ApiException.badRequest("GitHub login is not configured");
        }
        if ("telegram".equals(normalized) && !telegramEnabled) {
            throw ApiException.badRequest("Telegram login is not configured");
        }

        OAuthIdentity identity = extractIdentity(normalized);
        AuthService.AuthTokens tokens = authService.loginOrRegisterOAuth(
                normalized,
                identity.subject(),
                identity.email(),
                identity.displayName()
        );
        String code = oAuthCodeStore.put(tokens);

        try {
            oidcSession.logout().await().indefinitely();
        } catch (Exception e) {
            LOG.debugf(e, "OIDC session logout after token issue failed (continuing)");
        }

        URI redirect = URI.create(trimSlash(publicUrl) + "/oauth/callback?code=" + code);
        return Response.seeOther(redirect).cookie(oidcCookieClearer.expiredCookies()).build();
    }

    private OAuthIdentity extractIdentity(String provider) {
        UserInfo userInfo = securityIdentity.getAttribute(OidcUtils.USER_INFO_ATTRIBUTE);

        String subject = firstNonBlank(
                claim(userInfo, "id"),
                claim(userInfo, "sub"),
                stringClaim(idToken, "id"),
                stringClaim(idToken, "sub"),
                idToken.getSubject(),
                principalName()
        );
        String email = firstNonBlank(
                claim(userInfo, "email"),
                stringClaim(idToken, "email")
        );
        String displayName = firstNonBlank(
                claim(userInfo, "name"),
                claim(userInfo, "login"),
                stringClaim(idToken, "name"),
                stringClaim(idToken, "preferred_username"),
                stringClaim(idToken, "login"),
                claim(userInfo, "preferred_username"),
                email != null ? email.split("@")[0] : null
        );

        if ("github".equals(provider) && (email == null || email.isBlank())) {
            String login = firstNonBlank(claim(userInfo, "login"), stringClaim(idToken, "login"));
            if (login != null && !login.isBlank()) {
                email = login + "@users.noreply.github.com";
            }
        }
        if ("telegram".equals(provider) && (email == null || email.isBlank()) && subject != null) {
            email = subject + "@users.noreply.telegram.org";
        }

        if (subject == null || subject.isBlank()) {
            LOG.warnf(
                    "OAuth identity missing for provider=%s principal=%s idToken.sub=%s userInfoNull=%s",
                    provider,
                    principalName(),
                    idToken != null ? idToken.getSubject() : null,
                    userInfo == null
            );
            throw ApiException.unauthorized("OAuth provider did not return a user id");
        }
        if (email == null || email.isBlank()) {
            throw ApiException.unauthorized("OAuth provider did not return an email");
        }
        return new OAuthIdentity(subject, email, displayName);
    }

    private String principalName() {
        if (securityIdentity == null || securityIdentity.isAnonymous() || securityIdentity.getPrincipal() == null) {
            return null;
        }
        return securityIdentity.getPrincipal().getName();
    }

    private static String claim(UserInfo info, String name) {
        if (info == null || !info.contains(name) || info.get(name) == null) {
            return null;
        }
        return String.valueOf(info.get(name));
    }

    private static String stringClaim(JsonWebToken token, String name) {
        if (token == null) {
            return null;
        }
        Object value = token.getClaim(name);
        return value == null ? null : String.valueOf(value);
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank() && !"null".equals(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private static String trimSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:8080";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private record OAuthIdentity(String subject, String email, String displayName) {
    }
}
