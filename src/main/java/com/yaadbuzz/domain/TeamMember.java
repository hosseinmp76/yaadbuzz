package com.yaadbuzz.domain;

import com.yaadbuzz.enums.TeamRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.Optional;
import java.util.UUID;
import org.hibernate.search.mapper.pojo.automaticindexing.ReindexOnUpdate;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexingDependency;

@Entity
@Table(name = "team_member", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"team_id", "user_id"}),
        @UniqueConstraint(columnNames = {"team_id", "nickname"})
})
@Indexed
public class TeamMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    @IndexedEmbedded(includePaths = "id")
    @IndexingDependency(reindexOnUpdate = ReindexOnUpdate.SHALLOW)
    public Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @FullTextField(analyzer = "standard")
    @Column(nullable = false)
    public String nickname;

    @FullTextField(analyzer = "standard")
    @Column(columnDefinition = "TEXT")
    public String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public TeamRole role = TeamRole.MEMBER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avatar_id")
    public MediaAsset avatar;

    public static Optional<TeamMember> findByTeamAndUser(UUID teamId, UUID userId) {
        return find("team.id = ?1 and user.id = ?2 and deletedAt is null", teamId, userId).firstResultOptional();
    }

    public static Optional<TeamMember> findActiveById(UUID id) {
        return find("id = ?1 and deletedAt is null", id).firstResultOptional();
    }
}
