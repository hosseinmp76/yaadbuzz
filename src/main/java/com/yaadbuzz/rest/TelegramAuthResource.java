package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.OAuthCodeStore;
import com.yaadbuzz.auth.TelegramLoginVerifier;
import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.rest.dto.AuthDtos.AuthResponse;
import com.yaadbuzz.rest.dto.AuthDtos.TelegramLoginRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * Telegram login via same-window redirect to {@code oauth.telegram.org}
 * (avoids the Login Widget popup that never returns JWTs to the SPA).
 * See https://core.telegram.org/widgets/login
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

    @ConfigProperty(name = "yaadbuzz.oauth.telegram.bot-token", defaultValue = "")
    String botToken;

    @ConfigProperty(name = "yaadbuzz.public-url")
    String publicUrl;

    @GET
    @Path("/start")
    @Operation(summary = "Start Telegram login (same-window redirect)")
    public Response start() {
        requireEnabled();
        String origin = trimSlash(publicUrl);
        String returnTo = origin + "/api/auth/oauth/telegram";
        String botId = botIdFromToken(botToken);
        String target = "https://oauth.telegram.org/auth"
                + "?bot_id=" + urlEncode(botId)
                + "&origin=" + urlEncode(origin)
                + "&return_to=" + urlEncode(returnTo)
                + "&request_access=write";
        return Response.seeOther(URI.create(target)).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Complete Telegram login from widget onauth (optional)")
    public AuthResponse login(@Valid TelegramLoginRequest request) {
        AuthService.AuthTokens tokens = authenticate(toFields(request));
        return new AuthResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.user().id,
                tokens.user().email,
                tokens.user().displayName
        );
    }

    @GET
    @Operation(summary = "Telegram OAuth return_to callback")
    public Response callback(@Context UriInfo uriInfo) {
        Map<String, String> fields = new HashMap<>();
        uriInfo.getQueryParameters().forEach((key, values) -> {
            if (values != null && !values.isEmpty() && values.get(0) != null) {
                fields.put(key, values.get(0));
            }
        });
        AuthService.AuthTokens tokens = authenticate(fields);
        String code = oAuthCodeStore.put(tokens);
        URI redirect = URI.create(trimSlash(publicUrl) + "/oauth/callback?code=" + code);
        return Response.seeOther(redirect).build();
    }

    private void requireEnabled() {
        if (!telegramEnabled || botToken == null || botToken.isBlank()) {
            throw ApiException.badRequest("Telegram login is not configured");
        }
    }

    private AuthService.AuthTokens authenticate(Map<String, String> fields) {
        requireEnabled();
        telegramLoginVerifier.verify(fields);
        String id = fields.get("id");
        if (id == null || id.isBlank()) {
            throw ApiException.unauthorized("Invalid Telegram login payload");
        }
        return authService.loginOrRegisterOAuth(
                "telegram",
                id,
                TelegramLoginVerifier.syntheticEmail(id),
                TelegramLoginVerifier.displayName(
                        fields.get("first_name"),
                        fields.get("last_name"),
                        fields.get("username"),
                        id
                )
        );
    }

    private static String botIdFromToken(String token) {
        int colon = token.indexOf(':');
        if (colon <= 0) {
            throw ApiException.badRequest("Invalid Telegram bot token");
        }
        String id = token.substring(0, colon).trim();
        if (!id.chars().allMatch(Character::isDigit)) {
            throw ApiException.badRequest("Invalid Telegram bot token");
        }
        return id;
    }

    private static Map<String, String> toFields(TelegramLoginRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        put(fields, "id", request.id());
        put(fields, "first_name", request.firstName());
        put(fields, "last_name", request.lastName());
        put(fields, "username", request.username());
        put(fields, "photo_url", request.photoUrl());
        put(fields, "auth_date", request.authDate());
        put(fields, "hash", request.hash());
        return fields;
    }

    private static void put(Map<String, String> fields, String key, String value) {
        if (value != null && !value.isBlank()) {
            fields.put(key, value);
        }
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String trimSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:8080";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
