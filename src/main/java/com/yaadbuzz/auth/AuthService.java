package com.yaadbuzz.auth;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class AuthService {

    @Inject
    TokenService tokenService;

    @Inject
    JWTParser jwtParser;

    @Transactional
    public AuthTokens register(String email, String password, String displayName) {
        String normalized = email.trim().toLowerCase();
        if (normalized.isBlank() || password == null || password.length() < 8) {
            throw ApiException.badRequest("Valid email and password (min 8 chars) are required");
        }
        if (displayName == null || displayName.isBlank()) {
            throw ApiException.badRequest("Display name is required");
        }
        if (User.findByEmail(normalized).isPresent()) {
            throw ApiException.conflict("Email already registered");
        }
        User user = new User();
        user.email = normalized;
        user.passwordHash = BcryptUtil.bcryptHash(password);
        user.displayName = displayName.trim();
        user.persist();
        return tokensFor(user);
    }

    public AuthTokens login(String email, String password) {
        User user = User.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!BcryptUtil.matches(password, user.passwordHash)) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        return tokensFor(user);
    }

    public AuthTokens refresh(String refreshToken) {
        try {
            JsonWebToken jwt = jwtParser.parse(refreshToken);
            if (!"refresh".equals(jwt.getClaim("type")) && !jwt.getGroups().contains("refresh")) {
                throw ApiException.unauthorized("Invalid refresh token");
            }
            User user = User.findActiveById(java.util.UUID.fromString(jwt.getSubject()))
                    .orElseThrow(() -> ApiException.unauthorized("User not found"));
            return tokensFor(user);
        } catch (ParseException e) {
            throw ApiException.unauthorized("Invalid refresh token");
        }
    }

    private AuthTokens tokensFor(User user) {
        return new AuthTokens(
                tokenService.issueAccessToken(user),
                tokenService.issueRefreshToken(user),
                user
        );
    }

    public record AuthTokens(String accessToken, String refreshToken, User user) {
    }
}
