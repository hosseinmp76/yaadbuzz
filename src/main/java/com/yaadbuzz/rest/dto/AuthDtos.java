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
