package com.yaadbuzz.domain;

import com.yaadbuzz.enums.ExportStatus;
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
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "yearbook_export")
public class YearbookExport extends io.quarkus.hibernate.orm.panache.PanacheEntityBase {

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    public Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    public User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ExportStatus status = ExportStatus.PENDING;

    @Column(name = "file_url", length = 1024)
    public String fileUrl;

    @Column(name = "storage_key")
    public String storageKey;

    @Column(name = "error_message", columnDefinition = "TEXT")
    public String errorMessage;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @Column(name = "completed_at")
    public Instant completedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public static List<YearbookExport> listByTeam(UUID teamId) {
        return list("team.id = ?1 order by createdAt desc", teamId);
    }
}
