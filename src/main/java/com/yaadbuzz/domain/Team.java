package com.yaadbuzz.domain;

import com.yaadbuzz.enums.YearbookTheme;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "team")
public class Team extends BaseEntity {

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

    @Column(name = "yearbook_title")
    public String yearbookTitle;

    @Column(name = "yearbook_subtitle")
    public String yearbookSubtitle;

    @Column(name = "yearbook_dedication", columnDefinition = "TEXT")
    public String yearbookDedication;

    @Enumerated(EnumType.STRING)
    @Column(name = "yearbook_theme", nullable = false)
    public YearbookTheme yearbookTheme = YearbookTheme.CLASSIC;

    @Column(name = "yearbook_show_members", nullable = false)
    public boolean yearbookShowMembers = true;

    @Column(name = "yearbook_show_tributes", nullable = false)
    public boolean yearbookShowTributes = true;

    @Column(name = "yearbook_show_characteristics", nullable = false)
    public boolean yearbookShowCharacteristics = true;

    @Column(name = "yearbook_show_memories", nullable = false)
    public boolean yearbookShowMemories = true;

    @Column(name = "yearbook_show_awards", nullable = false)
    public boolean yearbookShowAwards = true;

    /** When true, clients encrypt texts/media with a shared AES key that never leaves the browser. */
    @Column(name = "encryption_enabled", nullable = false)
    public boolean encryptionEnabled = false;

    public boolean tributesRevealed() {
        if (revealTributes) {
            return true;
        }
        return revealAt != null && !revealAt.isAfter(Instant.now());
    }
}
