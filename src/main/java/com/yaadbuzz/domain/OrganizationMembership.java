package com.yaadbuzz.domain;

import com.yaadbuzz.enums.OrgRole;
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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "organization_membership", uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "user_id"}))
public class OrganizationMembership extends io.quarkus.hibernate.orm.panache.PanacheEntityBase {

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public OrgRole role;

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

    public static Optional<OrganizationMembership> findByOrgAndUser(UUID orgId, UUID userId) {
        return find("organization.id = ?1 and user.id = ?2", orgId, userId).firstResultOptional();
    }

    public static List<OrganizationMembership> listByUser(UUID userId) {
        return list("user.id = ?1", userId);
    }
}
