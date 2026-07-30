package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.OAuthCodeStore;
import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.rest.dto.AuthDtos.AuthResponse;
import com.yaadbuzz.rest.dto.AuthDtos.OAuthExchangeRequest;
import com.yaadbuzz.rest.dto.AuthDtos.OAuthProvidersResponse;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/auth/oauth")
@Tag(name = "Auth")
@PermitAll
public class OAuthResource {

    @Inject
    OAuthCodeStore oAuthCodeStore;

    @ConfigProperty(name = "yaadbuzz.oauth.google.enabled", defaultValue = "false")
    boolean googleEnabled;

    @ConfigProperty(name = "yaadbuzz.oauth.github.enabled", defaultValue = "false")
    boolean githubEnabled;

    @ConfigProperty(name = "yaadbuzz.oauth.telegram.enabled", defaultValue = "false")
    boolean telegramEnabled;

    @GET
    @Path("/providers")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Which social login providers are configured")
    public OAuthProvidersResponse providers() {
        return new OAuthProvidersResponse(googleEnabled, githubEnabled, telegramEnabled);
    }

    @POST
    @Path("/exchange")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Exchange one-time OAuth code for app JWTs")
    public AuthResponse exchange(@Valid OAuthExchangeRequest request) {
        AuthService.AuthTokens tokens = oAuthCodeStore.take(request.code());
        if (tokens == null) {
            throw ApiException.unauthorized("Invalid or expired OAuth login code");
        }
        return new AuthResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.user().id,
                tokens.user().email,
                tokens.user().displayName
        );
    }
}
