package com.yaadbuzz.rest.dto;

import com.yaadbuzz.enums.TeamRole;
import com.yaadbuzz.enums.YearbookTheme;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ApiRequests {

    private ApiRequests() {
    }

    public record UpdateProfileRequest(String displayName) {
    }

    public record CreateTeamRequest(String name, String brandColor, Boolean encryptionEnabled) {
    }

    public record UpdateTeamSettingsRequest(
            String brandColor,
            UUID coverMediaId,
            Boolean revealTributes,
            Instant revealAt
    ) {
    }

    public record UpdateYearbookSettingsRequest(
            String title,
            String subtitle,
            String dedication,
            YearbookTheme theme,
            Boolean showMembers,
            Boolean showTributes,
            Boolean showCharacteristics,
            Boolean showMemories,
            Boolean showAwards
    ) {
    }

    public record CreateInviteRequest(TeamRole role, Integer maxUses, Instant expiresAt) {
    }

    public record InviteByEmailRequest(String email, TeamRole role) {
    }

    public record JoinTeamRequest(String code, String nickname, String bio) {
    }

    public record AcceptInviteRequest(String nickname, String bio) {
    }

    public record UpsertTeamMemberProfileRequest(String nickname, String bio, UUID avatarId) {
    }

    public record CreateTributeRequest(
            UUID recipientId,
            String text,
            boolean anonymous,
            boolean privateTribute
    ) {
    }

    public record CreateMemoryRequest(
            String title,
            String bodyText,
            boolean privateMemory,
            List<UUID> taggedIds,
            List<UUID> mediaIds
    ) {
    }

    public record AddCommentRequest(String text, UUID parentId, List<UUID> mediaIds) {
    }

    public record CreateTopicRequest(String title) {
    }

    public record VoteTopicRequest(UUID nomineeId, Integer repetitions) {
    }

    public record AddCharacteristicRequest(String title) {
    }
}
