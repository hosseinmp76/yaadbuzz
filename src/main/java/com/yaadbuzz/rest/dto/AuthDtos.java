package com.yaadbuzz.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

public final class AuthDtos {

    private AuthDtos() {
    }

    @Schema(name = "RegisterRequest")
    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String displayName
    ) {
    }

    @Schema(name = "LoginRequest")
    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    @Schema(name = "RefreshRequest")
    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    @Schema(name = "ForgotPasswordRequest")
    public record ForgotPasswordRequest(@NotBlank @Email String email) {
    }

    @Schema(name = "ResetPasswordRequest")
    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 8) String newPassword
    ) {
    }

    @Schema(name = "ChangePasswordRequest")
    public record ChangePasswordRequest(
            String currentPassword,
            @NotBlank @Size(min = 8) String newPassword
    ) {
    }

    @Schema(name = "OAuthExchangeRequest")
    public record OAuthExchangeRequest(@NotBlank String code) {
    }

    @Schema(name = "OAuthProvidersResponse")
    public record OAuthProvidersResponse(boolean google, boolean github, boolean telegram) {
    }

    @Schema(name = "MessageResponse")
    public record MessageResponse(String message) {
    }

    @Schema(name = "AuthResponse")
    public record AuthResponse(
            String accessToken,
            String refreshToken,
            UUID userId,
            String email,
            String displayName
    ) {
    }
}
