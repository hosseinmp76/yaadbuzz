package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.auth.OidcCookieClearer;
import com.yaadbuzz.rest.dto.AuthDtos.AuthResponse;
import com.yaadbuzz.rest.dto.AuthDtos.ChangePasswordRequest;
import com.yaadbuzz.rest.dto.AuthDtos.ForgotPasswordRequest;
import com.yaadbuzz.rest.dto.AuthDtos.LoginRequest;
import com.yaadbuzz.rest.dto.AuthDtos.MessageResponse;
import com.yaadbuzz.rest.dto.AuthDtos.RefreshRequest;
import com.yaadbuzz.rest.dto.AuthDtos.RegisterRequest;
import com.yaadbuzz.rest.dto.AuthDtos.ResetPasswordRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
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

    @Inject
    CurrentUserService currentUserService;

    @Inject
    OidcCookieClearer oidcCookieClearer;

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

    @POST
    @Path("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public MessageResponse forgotPassword(@Valid ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.email());
        return new MessageResponse(
                "If an account exists for that email, a reset link has been sent."
        );
    }

    @POST
    @Path("/reset-password")
    @Operation(summary = "Reset password using email token")
    public MessageResponse resetPassword(@Valid ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return new MessageResponse("Password updated. You can log in with your new password.");
    }

    @POST
    @Path("/logout")
    @Operation(summary = "Clear local session and OIDC cookies")
    public Response logout() {
        return Response.noContent().cookie(oidcCookieClearer.expiredCookies()).build();
    }

    @POST
    @Path("/change-password")
    @RolesAllowed("user")
    @Operation(summary = "Change password while authenticated")
    public MessageResponse changePassword(@Valid ChangePasswordRequest request) {
        authService.changePassword(
                currentUserService.requireUser(),
                request.currentPassword(),
                request.newPassword()
        );
        return new MessageResponse("Password changed.");
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
