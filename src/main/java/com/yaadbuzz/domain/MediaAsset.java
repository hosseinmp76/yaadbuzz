package com.yaadbuzz.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_asset")
public class MediaAsset extends io.quarkus.hibernate.orm.panache.PanacheEntityBase {

    @jakarta.persistence.Id
    public UUID id;

    @Column(name = "storage_key", nullable = false, unique = true)
    public String storageKey;

    @Column(nullable = false, length = 1024)
    public String url;

    @Column(name = "mime_type", nullable = false)
    public String mimeType;

    @Column(name = "size_bytes", nullable = false)
    public long sizeBytes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    public User uploadedBy;

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
}
