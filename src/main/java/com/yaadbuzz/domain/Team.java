package com.yaadbuzz.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "team")
public class Team extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @Column(nullable = false)
    public String name;

    @Column(name = "brand_color")
    public String brandColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cover_media_id")
    public MediaAsset coverMedia;

    @Column(name = "reveal_tributes", nullable = false)
    public boolean revealTributes = false;

    @Column(name = "reveal_at")
    public Instant revealAt;

    public boolean tributesRevealed() {
        if (revealTributes) {
            return true;
        }
        return revealAt != null && !revealAt.isAfter(Instant.now());
    }

    public static List<Team> listByOrganization(UUID organizationId) {
        return list("organization.id = ?1 and deletedAt is null order by createdAt desc", organizationId);
    }
}
