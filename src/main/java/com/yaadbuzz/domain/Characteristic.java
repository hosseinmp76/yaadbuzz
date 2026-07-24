package com.yaadbuzz.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "characteristic", uniqueConstraints = @UniqueConstraint(columnNames = {"team_member_id", "title"}))
public class Characteristic extends io.quarkus.hibernate.orm.panache.PanacheEntityBase {

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_member_id", nullable = false)
    public TeamMember teamMember;

    @Column(nullable = false)
    public String title;

    @Column(nullable = false)
    public int count = 1;

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

    public static Optional<Characteristic> findByMemberAndTitle(UUID memberId, String title) {
        return find("teamMember.id = ?1 and title = ?2", memberId, title).firstResultOptional();
    }
}
