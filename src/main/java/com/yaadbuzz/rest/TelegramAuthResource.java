package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.OAuthCodeStore;
import com.yaadbuzz.auth.TelegramLoginVerifier;
import com.yaadbuzz.common.ApiException;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Telegram Login Widget callback (HMAC-verified). Not OIDC — see
 * https://core.telegram.org/widgets/login
 */
@Path("/api/auth/oauth/telegram")
@Tag(name = "Auth")
@PermitAll
public class TelegramAuthResource {

    @Inject
    TelegramLoginVerifier telegramLoginVerifier;

    @Inject
    AuthService authService;

    @Inject
    OAuthCodeStore oAuthCodeStore;

    @ConfigProperty(name = "yaadbuzz.oauth.telegram.enabled", defaultValue = "false")
    boolean telegramEnabled;

    @ConfigProperty(name = "yaadbuzz.public-url")
    String publicUrl;

    @GET
    @Operation(summary = "Telegram Login Widget callback")
    public Response callback(@Context UriInfo uriInfo) {
        if (!telegramEnabled) {
            throw ApiException.badRequest("Telegram login is not configured");
        }

        Map<String, String> fields = new HashMap<>();
        uriInfo.getQueryParameters().forEach((key, values) -> {
            if (values != null && !values.isEmpty() && values.get(0) != null) {
                fields.put(key, values.get(0));
            }
        });

        telegramLoginVerifier.verify(fields);

        String id = fields.get("id");
        String email = TelegramLoginVerifier.syntheticEmail(id);
        String displayName = TelegramLoginVerifier.displayName(
                fields.get("first_name"),
                fields.get("last_name"),
                fields.get("username"),
                id
        );

        AuthService.AuthTokens tokens = authService.loginOrRegisterOAuth(
                "telegram",
                id,
                email,
                displayName
        );
        String code = oAuthCodeStore.put(tokens);
        URI redirect = URI.create(trimSlash(publicUrl) + "/oauth/callback?code=" + code);
        return Response.seeOther(redirect).build();
    }

    private static String trimSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:8080";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
