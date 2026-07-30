package com.yaadbuzz.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    public String email;

    @Column(name = "password_hash")
    public String passwordHash;

    @Column(name = "display_name", nullable = false)
    public String displayName;

    @Column(name = "password_reset_token_hash")
    public String passwordResetTokenHash;

    @Column(name = "password_reset_expires_at")
    public Instant passwordResetExpiresAt;

    @Column(name = "oauth_provider")
    public String oauthProvider;

    @Column(name = "oauth_subject")
    public String oauthSubject;

    public static Optional<User> findByEmail(String email) {
        return find("email = ?1 and deletedAt is null", email.toLowerCase()).firstResultOptional();
    }

    public static Optional<User> findActiveById(UUID id) {
        return find("id = ?1 and deletedAt is null", id).firstResultOptional();
    }

    public static Optional<User> findByPasswordResetTokenHash(String tokenHash) {
        return find(
                "passwordResetTokenHash = ?1 and deletedAt is null and passwordResetExpiresAt > ?2",
                tokenHash,
                Instant.now()
        ).firstResultOptional();
    }

    public static Optional<User> findByOAuth(String provider, String subject) {
        return find(
                "oauthProvider = ?1 and oauthSubject = ?2 and deletedAt is null",
                provider,
                subject
        ).firstResultOptional();
    }

    public boolean hasPassword() {
        return passwordHash != null && !passwordHash.isBlank();
    }
}
