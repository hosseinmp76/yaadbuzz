package com.yaadbuzz.rest.dto;

import com.yaadbuzz.domain.Characteristic;
import com.yaadbuzz.domain.Comment;
import com.yaadbuzz.domain.Invite;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.TeamRole;
import com.yaadbuzz.enums.YearbookTheme;
import com.yaadbuzz.yearbook.YearbookContent;
import com.yaadbuzz.search.SearchService;
import com.yaadbuzz.service.TopicService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record UserType(UUID id, String email, String displayName) {
        public static UserType from(User user) {
            return new UserType(user.id, user.email, user.displayName);
        }
    }

    public record MediaType(UUID id, String url, String mimeType) {
        public static MediaType from(MediaAsset asset) {
            if (asset == null) {
                return null;
            }
            return new MediaType(asset.id, asset.url, asset.mimeType);
        }
    }

    public record TeamType(
            UUID id,
            String name,
            String brandColor,
            MediaType coverMedia,
            boolean revealTributes,
            Instant revealAt,
            boolean tributesRevealed,
            String yearbookTitle,
            String yearbookSubtitle,
            String yearbookDedication,
            YearbookTheme yearbookTheme,
            boolean yearbookShowMembers,
            boolean yearbookShowTributes,
            boolean yearbookShowCharacteristics,
            boolean yearbookShowMemories,
            boolean yearbookShowAwards,
            boolean encryptionEnabled
    ) {
        public static TeamType from(Team team) {
            return new TeamType(
                    team.id,
                    team.name,
                    team.brandColor,
                    MediaType.from(team.coverMedia),
                    team.revealTributes,
                    team.revealAt,
                    team.tributesRevealed(),
                    team.yearbookTitle,
                    team.yearbookSubtitle,
                    team.yearbookDedication,
                    team.yearbookTheme == null ? YearbookTheme.CLASSIC : team.yearbookTheme,
                    team.yearbookShowMembers,
                    team.yearbookShowTributes,
                    team.yearbookShowCharacteristics,
                    team.yearbookShowMemories,
                    team.yearbookShowAwards,
                    team.encryptionEnabled
            );
        }
    }

    public record TeamMemberType(
            UUID id,
            UUID teamId,
            UUID userId,
            String nickname,
            String bio,
            TeamRole role,
            MediaType avatar
    ) {
        public static TeamMemberType from(TeamMember member) {
            return new TeamMemberType(
                    member.id,
                    member.team.id,
                    member.user.id,
                    member.nickname,
                    member.bio,
                    member.role,
                    MediaType.from(member.avatar)
            );
        }
    }

    public record InviteType(
            UUID id,
            UUID teamId,
            String code,
            TeamRole role,
            Integer maxUses,
            int useCount,
            Instant expiresAt,
            String email
    ) {
        public static InviteType from(Invite invite) {
            return new InviteType(
                    invite.id,
                    invite.team.id,
                    invite.code,
                    invite.role,
                    invite.maxUses,
                    invite.useCount,
                    invite.expiresAt,
                    invite.email
            );
        }
    }

    public record PendingInviteType(
            UUID id,
            UUID teamId,
            String teamName,
            TeamRole role,
            Instant createdAt
    ) {
        public static PendingInviteType from(Invite invite) {
            return new PendingInviteType(
                    invite.id,
                    invite.team.id,
                    invite.team.name,
                    invite.role,
                    invite.createdAt
            );
        }
    }

    public record TributeType(
            UUID id,
            UUID teamId,
            TeamMemberType writer,
            TeamMemberType recipient,
            String text,
            boolean anonymous,
            boolean privateTribute,
            boolean published,
            List<MediaType> pictures,
            Instant createdAt
    ) {
        public static TributeType from(Tribute tribute) {
            TeamMemberType writer = tribute.anonymous
                    ? new TeamMemberType(null, tribute.team.id, null, "Anonymous", null, null, null)
                    : TeamMemberType.from(tribute.writer);
            return new TributeType(
                    tribute.id,
                    tribute.team.id,
                    writer,
                    TeamMemberType.from(tribute.recipient),
                    tribute.text,
                    tribute.anonymous,
                    tribute.privateTribute,
                    !tribute.hidden && !tribute.privateTribute,
                    tribute.pictures == null
                            ? List.of()
                            : tribute.pictures.stream().map(MediaType::from).toList(),
                    tribute.createdAt
            );
        }
    }

    public record MemoryType(
            UUID id,
            UUID teamId,
            TeamMemberType writer,
            String title,
            String bodyText,
            boolean privateMemory,
            List<TeamMemberType> tagged,
            List<MediaType> pictures,
            Instant createdAt
    ) {
        public static MemoryType from(Memory memory) {
            return new MemoryType(
                    memory.id,
                    memory.team.id,
                    TeamMemberType.from(memory.writer),
                    memory.title,
                    memory.bodyText,
                    memory.privateMemory,
                    memory.tagged.stream().map(TeamMemberType::from).toList(),
                    memory.pictures == null
                            ? List.of()
                            : memory.pictures.stream().map(MediaType::from).toList(),
                    memory.createdAt
            );
        }
    }

    public record CommentType(
            UUID id,
            UUID memoryId,
            TeamMemberType writer,
            String text,
            List<MediaType> pictures,
            Instant createdAt
    ) {
        public static CommentType from(Comment comment) {
            return new CommentType(
                    comment.id,
                    comment.memory.id,
                    TeamMemberType.from(comment.writer),
                    comment.text,
                    comment.pictures == null
                            ? List.of()
                            : comment.pictures.stream().map(MediaType::from).toList(),
                    comment.createdAt
            );
        }
    }

    public record TopicType(UUID id, UUID teamId, String title) {
        public static TopicType from(Topic topic) {
            return new TopicType(topic.id, topic.team.id, topic.title);
        }
    }

    public record TopicStandingType(TeamMemberType nominee, int score) {
        public static TopicStandingType from(TopicService.TopicStanding standing) {
            return new TopicStandingType(TeamMemberType.from(standing.nominee()), standing.score());
        }
    }

    public record CharacteristicType(UUID id, UUID teamMemberId, String title, int count) {
        public static CharacteristicType from(Characteristic characteristic) {
            return new CharacteristicType(
                    characteristic.id,
                    characteristic.teamMember.id,
                    characteristic.title,
                    characteristic.count
            );
        }
    }

    public record YearbookCharacteristicType(String title, int count) {
    }

    public record YearbookTributeType(String text, String writer) {
    }

    public record YearbookMemberType(
            String nickname,
            String bio,
            String avatarUrl,
            List<YearbookCharacteristicType> characteristics,
            List<YearbookTributeType> tributes
    ) {
    }

    public record YearbookCommentType(String text, String writer, List<String> imageUrls) {
    }

    public record YearbookMemoryType(
            String title,
            String body,
            String writer,
            List<String> imageUrls,
            List<YearbookCommentType> comments
    ) {
    }

    public record YearbookStandingType(String nickname, int score) {
    }

    public record YearbookTopicType(String title, List<YearbookStandingType> standings) {
    }

    public record YearbookType(
            UUID teamId,
            String orgName,
            String teamName,
            String title,
            String subtitle,
            String dedication,
            YearbookTheme theme,
            String brandColor,
            String logoUrl,
            String coverMediaUrl,
            boolean showMembers,
            boolean showTributes,
            boolean showCharacteristics,
            boolean showMemories,
            boolean showAwards,
            List<YearbookMemberType> members,
            List<YearbookMemoryType> memories,
            List<YearbookTopicType> topics
    ) {
        public static YearbookType from(YearbookContent content) {
            return new YearbookType(
                    content.teamId(),
                    content.orgName(),
                    content.teamName(),
                    content.title(),
                    content.subtitle(),
                    content.dedication(),
                    YearbookTheme.valueOf(content.theme()),
                    content.brandColor(),
                    emptyToNull(content.logoUrl()),
                    emptyToNull(content.coverMediaUrl()),
                    content.showMembers(),
                    content.showTributes(),
                    content.showCharacteristics(),
                    content.showMemories(),
                    content.showAwards(),
                    content.members().stream()
                            .map(m -> new YearbookMemberType(
                                    m.nickname(),
                                    m.bio(),
                                    emptyToNull(m.avatarUrl()),
                                    m.characteristics().stream()
                                            .map(c -> new YearbookCharacteristicType(c.title(), c.count()))
                                            .toList(),
                                    m.tributes().stream()
                                            .map(t -> new YearbookTributeType(t.text(), t.writer()))
                                            .toList()))
                            .toList(),
                    content.memories().stream()
                            .map(m -> new YearbookMemoryType(
                                    m.title(),
                                    m.body(),
                                    m.writer(),
                                    m.imageUrls(),
                                    m.comments().stream()
                                            .map(c -> new YearbookCommentType(
                                                    c.text(), c.writer(), c.imageUrls()))
                                            .toList()))
                            .toList(),
                    content.topics().stream()
                            .map(t -> new YearbookTopicType(
                                    t.title(),
                                    t.standings().stream()
                                            .map(s -> new YearbookStandingType(s.nickname(), s.score()))
                                            .toList()))
                            .toList());
        }

        private static String emptyToNull(String value) {
            return value == null || value.isBlank() ? null : value;
        }
    }

    public record SearchHitType(String type, UUID id, String title, String snippet) {
        public static SearchHitType from(SearchService.SearchHit hit) {
            return new SearchHitType(hit.type(), hit.id(), hit.title(), hit.snippet());
        }
    }

    public record ConnectionTeamMember(List<TeamMemberType> items, String nextCursor, boolean hasNext) {
    }

    public record ConnectionTribute(List<TributeType> items, String nextCursor, boolean hasNext) {
    }

    public record ConnectionMemory(List<MemoryType> items, String nextCursor, boolean hasNext) {
    }

    public record ConnectionSearch(List<SearchHitType> items, String nextCursor, boolean hasNext) {
    }
}

