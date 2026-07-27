package com.yaadbuzz.domain;

import com.yaadbuzz.enums.TeamRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "invite")
public class Invite extends io.quarkus.hibernate.orm.panache.PanacheEntityBase {

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    public Team team;

    @Column(nullable = false, unique = true)
    public String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public TeamRole role = TeamRole.MEMBER;

    @Column(name = "max_uses")
    public Integer maxUses;

    @Column(name = "use_count", nullable = false)
    public int useCount = 0;

    @Column(name = "expires_at")
    public Instant expiresAt;

    @Column(length = 320)
    public String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    public User createdBy;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isValid() {
        if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
            return false;
        }
        return maxUses == null || useCount < maxUses;
    }

    public static Optional<Invite> findByCode(String code) {
        return find("code", code).firstResultOptional();
    }
}
