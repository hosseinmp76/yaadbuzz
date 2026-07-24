package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.rest.dto.AuthDtos.AuthResponse;
import com.yaadbuzz.rest.dto.AuthDtos.LoginRequest;
import com.yaadbuzz.rest.dto.AuthDtos.RefreshRequest;
import com.yaadbuzz.rest.dto.AuthDtos.RegisterRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Auth")
@PermitAll
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    @Operation(summary = "Register with email and password")
    public AuthResponse register(@Valid RegisterRequest request) {
        var tokens = authService.register(request.email(), request.password(), request.displayName());
        return toResponse(tokens);
    }

    @POST
    @Path("/login")
    @Operation(summary = "Login with email and password")
    public AuthResponse login(@Valid LoginRequest request) {
        var tokens = authService.login(request.email(), request.password());
        return toResponse(tokens);
    }

    @POST
    @Path("/refresh")
    @Operation(summary = "Refresh access token")
    public AuthResponse refresh(@Valid RefreshRequest request) {
        var tokens = authService.refresh(request.refreshToken());
        return toResponse(tokens);
    }

    private AuthResponse toResponse(AuthService.AuthTokens tokens) {
        return new AuthResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.user().id,
                tokens.user().email,
                tokens.user().displayName
        );
    }
}
