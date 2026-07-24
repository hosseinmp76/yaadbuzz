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
@Table(name = "topic_vote", uniqueConstraints = @UniqueConstraint(columnNames = {"topic_id", "voter_id"}))
public class TopicVote extends io.quarkus.hibernate.orm.panache.PanacheEntityBase {

    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    public Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voter_id", nullable = false)
    public TeamMember voter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id", nullable = false)
    public TeamMember nominee;

    @Column(nullable = false)
    public int repetitions = 1;

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

    public static Optional<TopicVote> findByTopicAndVoter(UUID topicId, UUID voterId) {
        return find("topic.id = ?1 and voter.id = ?2", topicId, voterId).firstResultOptional();
    }
}
