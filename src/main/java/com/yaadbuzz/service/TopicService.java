package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.TopicVote;
import com.yaadbuzz.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class TopicService {

    @Inject
    AccessService accessService;

    @Transactional
    public Topic create(UUID teamId, User user, String title) {
        accessService.requireTeamAdmin(teamId, user);
        if (title == null || title.isBlank()) {
            throw ApiException.badRequest("Topic title is required");
        }
        Topic topic = new Topic();
        topic.team = accessService.requireTeam(teamId);
        topic.title = title.trim();
        topic.persist();
        return topic;
    }

    public List<Topic> list(UUID teamId, User user) {
        accessService.requireTeamMember(teamId, user);
        return Topic.list("team.id = ?1 and deletedAt is null order by createdAt asc", teamId);
    }

    @Transactional
    public TopicVote vote(UUID topicId, User user, UUID nomineeId, Integer repetitions) {
        Topic topic = Topic.findById(topicId);
        if (topic == null || topic.isDeleted()) {
            throw ApiException.notFound("Topic not found");
        }
        TeamMember voter = accessService.requireTeamMember(topic.team.id, user);
        TeamMember nominee = TeamMember.findActiveById(nomineeId)
                .orElseThrow(() -> ApiException.notFound("Nominee not found"));
        if (!nominee.team.id.equals(topic.team.id)) {
            throw ApiException.badRequest("Nominee must be in the same team");
        }
        int reps = repetitions == null || repetitions < 1 ? 1 : repetitions;
        TopicVote vote = TopicVote.findByTopicAndVoter(topicId, voter.id).orElseGet(TopicVote::new);
        vote.topic = topic;
        vote.voter = voter;
        vote.nominee = nominee;
        vote.repetitions = reps;
        if (vote.id == null) {
            vote.persist();
        }
        return vote;
    }

    public List<TopicStanding> standings(UUID topicId, User user) {
        Topic topic = Topic.findById(topicId);
        if (topic == null || topic.isDeleted()) {
            throw ApiException.notFound("Topic not found");
        }
        accessService.requireTeamMember(topic.team.id, user);
        List<TopicVote> votes = TopicVote.list("topic.id", topicId);
        Map<UUID, TopicStanding> map = new HashMap<>();
        for (TopicVote vote : votes) {
            map.compute(vote.nominee.id, (id, existing) -> {
                if (existing == null) {
                    return new TopicStanding(vote.nominee, vote.repetitions);
                }
                return new TopicStanding(vote.nominee, existing.score() + vote.repetitions);
            });
        }
        return map.values().stream()
                .sorted(Comparator.comparingInt(TopicStanding::score).reversed())
                .toList();
    }

    public record TopicStanding(TeamMember nominee, int score) {
    }
}
