package com.yaadbuzz.pdf;

import com.yaadbuzz.domain.Characteristic;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.TopicVote;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.YearbookTheme;
import com.yaadbuzz.service.AccessService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.hibernate.Hibernate;

@ApplicationScoped
public class YearbookContentService {

    @Inject
    AccessService accessService;

    public YearbookContent loadForTeam(UUID teamId, User user) {
        accessService.requireTeamMember(teamId, user);
        Team team = accessService.requireTeam(teamId);
        return assemble(team);
    }

    public YearbookContent assemble(Team team) {
        List<TeamMember> members = TeamMember.list(
                "team.id = ?1 and deletedAt is null order by nickname asc", team.id);
        List<Tribute> tributes = Tribute.list(
                "team.id = ?1 and deletedAt is null and hidden = false order by createdAt asc", team.id);
        List<Memory> memories = Memory.list(
                "team.id = ?1 and deletedAt is null and privateMemory = false order by createdAt asc", team.id);
        List<Topic> topics = Topic.list(
                "team.id = ?1 and deletedAt is null order by createdAt asc", team.id);

        Map<UUID, List<YearbookContent.Tribute>> tributesByRecipient = new HashMap<>();
        for (Tribute tribute : tributes) {
            tributesByRecipient
                    .computeIfAbsent(tribute.recipient.id, k -> new ArrayList<>())
                    .add(new YearbookContent.Tribute(
                            tribute.text,
                            tribute.anonymous ? "Anonymous" : tribute.writer.nickname));
        }

        List<YearbookContent.Member> memberViews = members.stream().map(m -> {
            List<Characteristic> characteristics = Characteristic.list(
                    "teamMember.id = ?1 order by count desc", m.id);
            return new YearbookContent.Member(
                    m.nickname,
                    m.bio == null ? "" : m.bio,
                    m.avatar == null ? "" : m.avatar.url,
                    characteristics.stream()
                            .map(c -> new YearbookContent.Characteristic(c.title, c.count))
                            .toList(),
                    tributesByRecipient.getOrDefault(m.id, List.of()));
        }).toList();

        List<YearbookContent.Topic> topicViews = topics.stream().map(t -> {
            List<TopicVote> votes = TopicVote.list("topic.id", t.id);
            Map<UUID, Integer> scores = new HashMap<>();
            Map<UUID, TeamMember> nominees = new HashMap<>();
            for (TopicVote vote : votes) {
                scores.merge(vote.nominee.id, vote.repetitions, Integer::sum);
                nominees.put(vote.nominee.id, vote.nominee);
            }
            List<YearbookContent.Standing> standings = scores.entrySet().stream()
                    .sorted(Map.Entry.<UUID, Integer>comparingByValue().reversed())
                    .limit(3)
                    .map(e -> new YearbookContent.Standing(nominees.get(e.getKey()).nickname, e.getValue()))
                    .toList();
            return new YearbookContent.Topic(t.title, standings);
        }).toList();

        List<YearbookContent.Memory> memoryViews = memories.stream()
                .sorted(Comparator.comparing((Memory m) -> m.createdAt))
                .map(m -> {
                    Hibernate.initialize(m.pictures);
                    List<String> imageUrls = m.pictures == null
                            ? List.of()
                            : m.pictures.stream().map(a -> a.url).toList();
                    return new YearbookContent.Memory(
                            m.title == null ? "" : m.title,
                            m.bodyText,
                            m.writer.nickname,
                            imageUrls);
                })
                .toList();

        String brand = team.brandColor == null
                ? (team.organization.brandColor == null ? "#0F766E" : team.organization.brandColor)
                : team.brandColor;
        String logoUrl = team.organization.logo == null ? "" : team.organization.logo.url;
        String coverUrl = team.coverMedia == null ? "" : team.coverMedia.url;
        YearbookTheme theme = team.yearbookTheme == null ? YearbookTheme.CLASSIC : team.yearbookTheme;

        String title = blankToNull(team.yearbookTitle) != null
                ? team.yearbookTitle.trim()
                : team.name + " Yearbook";
        String subtitle = blankToNull(team.yearbookSubtitle) != null
                ? team.yearbookSubtitle.trim()
                : team.organization.name;

        return new YearbookContent(
                team.id,
                team.organization.name,
                team.name,
                title,
                subtitle,
                team.yearbookDedication == null ? "" : team.yearbookDedication,
                theme.name(),
                brand,
                logoUrl,
                coverUrl,
                team.yearbookShowMembers,
                team.yearbookShowTributes,
                team.yearbookShowCharacteristics,
                team.yearbookShowMemories,
                team.yearbookShowAwards,
                memberViews,
                memoryViews,
                topicViews);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
