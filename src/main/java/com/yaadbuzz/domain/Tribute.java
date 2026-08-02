package com.yaadbuzz.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.search.mapper.pojo.automaticindexing.ReindexOnUpdate;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexingDependency;

@Entity
@Table(name = "tribute")
@Indexed
public class Tribute extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    @IndexedEmbedded(includePaths = "id")
    @IndexingDependency(reindexOnUpdate = ReindexOnUpdate.SHALLOW)
    public Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    public TeamMember writer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    public TeamMember recipient;

    @FullTextField(analyzer = "standard")
    @Column(nullable = false, columnDefinition = "TEXT")
    public String text;

    @Column(name = "is_anonymous", nullable = false)
    public boolean anonymous;

    @Column(name = "is_private", nullable = false)
    public boolean privateTribute;

    /** When true, only writer and recipient can see the tribute until the recipient publishes. */
    @Column(nullable = false)
    public boolean hidden = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "tribute_media",
            joinColumns = @JoinColumn(name = "tribute_id"),
            inverseJoinColumns = @JoinColumn(name = "media_asset_id")
    )
    public Set<MediaAsset> pictures = new HashSet<>();
}
