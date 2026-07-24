package com.yaadbuzz.graphql.types;

import com.yaadbuzz.domain.Characteristic;
import com.yaadbuzz.domain.Comment;
import com.yaadbuzz.domain.Invite;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.domain.YearbookExport;
import com.yaadbuzz.enums.ExportStatus;
import com.yaadbuzz.enums.OrgRole;
import com.yaadbuzz.enums.TeamRole;
import com.yaadbuzz.search.SearchService;
import com.yaadbuzz.service.TopicService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class GqlTypes {

    private GqlTypes() {
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

    public record OrganizationType(UUID id, String name, String brandColor, MediaType logo) {
        public static OrganizationType from(Organization org) {
            return new OrganizationType(org.id, org.name, org.brandColor, MediaType.from(org.logo));
        }
    }

    public record TeamType(
            UUID id,
            UUID organizationId,
            String name,
            String brandColor,
            MediaType coverMedia,
            boolean revealTributes,
            Instant revealAt,
            boolean tributesRevealed
    ) {
        public static TeamType from(Team team) {
            return new TeamType(
                    team.id,
                    team.organization.id,
                    team.name,
                    team.brandColor,
                    MediaType.from(team.coverMedia),
                    team.revealTributes,
                    team.revealAt,
                    team.tributesRevealed()
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

    public record InviteType(UUID id, UUID teamId, String code, TeamRole role, Integer maxUses, int useCount, Instant expiresAt) {
        public static InviteType from(Invite invite) {
            return new InviteType(
                    invite.id,
                    invite.team.id,
                    invite.code,
                    invite.role,
                    invite.maxUses,
                    invite.useCount,
                    invite.expiresAt
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
            boolean hidden,
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
                    tribute.hidden,
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
                    memory.createdAt
            );
        }
    }

    public record CommentType(UUID id, UUID memoryId, TeamMemberType writer, String text, Instant createdAt) {
        public static CommentType from(Comment comment) {
            return new CommentType(
                    comment.id,
                    comment.memory.id,
                    TeamMemberType.from(comment.writer),
                    comment.text,
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

    public record YearbookExportType(
            UUID id,
            UUID teamId,
            ExportStatus status,
            String fileUrl,
            String errorMessage,
            Instant createdAt,
            Instant completedAt
    ) {
        public static YearbookExportType from(YearbookExport export) {
            return new YearbookExportType(
                    export.id,
                    export.team.id,
                    export.status,
                    export.fileUrl,
                    export.errorMessage,
                    export.createdAt,
                    export.completedAt
            );
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

    public record OrgRoleType(OrgRole role) {
    }
}
