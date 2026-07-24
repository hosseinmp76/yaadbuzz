package com.yaadbuzz.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    public String email;

    @Column(name = "password_hash", nullable = false)
    public String passwordHash;

    @Column(name = "display_name", nullable = false)
    public String displayName;

    public static Optional<User> findByEmail(String email) {
        return find("email = ?1 and deletedAt is null", email.toLowerCase()).firstResultOptional();
    }

    public static Optional<User> findActiveById(UUID id) {
        return find("id = ?1 and deletedAt is null", id).firstResultOptional();
    }
}
