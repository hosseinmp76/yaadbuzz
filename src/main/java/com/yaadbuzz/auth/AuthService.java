package com.yaadbuzz.auth;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.mail.EmailService;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    @Inject
    TokenService tokenService;

    @Inject
    JWTParser jwtParser;

    @Inject
    EmailService emailService;

    @ConfigProperty(name = "yaadbuzz.password-reset.ttl", defaultValue = "PT1H")
    Duration passwordResetTtl;

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
        if (!user.hasPassword() || !BcryptUtil.matches(password, user.passwordHash)) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        return tokensFor(user);
    }

    /**
     * Find or create a local user from a verified Google/GitHub identity, then issue app JWTs.
     */
    @Transactional
    public AuthTokens loginOrRegisterOAuth(
            String provider,
            String subject,
            String email,
            String displayName
    ) {
        if (provider == null || provider.isBlank() || subject == null || subject.isBlank()) {
            throw ApiException.badRequest("OAuth identity is incomplete");
        }
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest(
                    "Email permission is required. Allow email access from " + provider + " and try again."
            );
        }
        String normalizedProvider = provider.trim().toLowerCase();
        String normalizedEmail = email.trim().toLowerCase();
        String name = (displayName == null || displayName.isBlank())
                ? normalizedEmail.split("@")[0]
                : displayName.trim();

        Optional<User> byOauth = User.findByOAuth(normalizedProvider, subject);
        if (byOauth.isPresent()) {
            User user = byOauth.get();
            if (!normalizedEmail.equals(user.email)) {
                // Provider email changed; keep account if free, else keep existing email.
                if (User.findByEmail(normalizedEmail).filter(u -> !u.id.equals(user.id)).isEmpty()) {
                    user.email = normalizedEmail;
                }
            }
            if (user.displayName == null || user.displayName.isBlank()) {
                user.displayName = name;
            }
            return tokensFor(user);
        }

        Optional<User> byEmail = User.findByEmail(normalizedEmail);
        if (byEmail.isPresent()) {
            User user = byEmail.get();
            if (user.oauthProvider != null
                    && !user.oauthProvider.equals(normalizedProvider)) {
                throw ApiException.conflict(
                        "This email is already linked to another sign-in method. Log in with that method."
                );
            }
            user.oauthProvider = normalizedProvider;
            user.oauthSubject = subject;
            return tokensFor(user);
        }

        User user = new User();
        user.email = normalizedEmail;
        user.passwordHash = null;
        user.displayName = name;
        user.oauthProvider = normalizedProvider;
        user.oauthSubject = subject;
        user.persist();
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

    @Transactional
    public User updateDisplayName(User user, String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw ApiException.badRequest("Display name is required");
        }
        User managed = User.findActiveById(user.id)
                .orElseThrow(() -> ApiException.unauthorized("User not found"));
        managed.displayName = displayName.trim();
        return managed;
    }

    /**
     * Always succeeds with a generic message to avoid email enumeration.
     */
    @Transactional
    public void requestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        String normalized = email.trim().toLowerCase();
        User.findByEmail(normalized).ifPresent(user -> {
            String rawToken = generateToken();
            user.passwordResetTokenHash = hashToken(rawToken);
            user.passwordResetExpiresAt = Instant.now().plus(passwordResetTtl);
            try {
                emailService.sendPasswordReset(user.email, user.displayName, rawToken);
            } catch (Exception e) {
                LOG.errorf(e, "Password reset email failed for %s", user.email);
                throw ApiException.badRequest("Could not send reset email. Try again later.");
            }
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw ApiException.badRequest("Reset token is required");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw ApiException.badRequest("Password must be at least 8 characters");
        }
        User user = User.findByPasswordResetTokenHash(hashToken(rawToken.trim()))
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset token"));
        user.passwordHash = BcryptUtil.bcryptHash(newPassword);
        user.passwordResetTokenHash = null;
        user.passwordResetExpiresAt = null;
    }

    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw ApiException.badRequest("New password must be at least 8 characters");
        }
        User managed = User.findActiveById(user.id)
                .orElseThrow(() -> ApiException.unauthorized("User not found"));
        if (managed.hasPassword()) {
            if (currentPassword == null || currentPassword.isBlank()) {
                throw ApiException.badRequest("Current password is required");
            }
            if (!BcryptUtil.matches(currentPassword, managed.passwordHash)) {
                throw ApiException.unauthorized("Current password is incorrect");
            }
        }
        managed.passwordHash = BcryptUtil.bcryptHash(newPassword);
        managed.passwordResetTokenHash = null;
        managed.passwordResetExpiresAt = null;
    }

    private AuthTokens tokensFor(User user) {
        return new AuthTokens(
                tokenService.issueAccessToken(user),
                tokenService.issueRefreshToken(user),
                user
        );
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    public record AuthTokens(String accessToken, String refreshToken, User user) {
    }
}
