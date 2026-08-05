package com.yaadbuzz.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.support.ApiClient;
import com.yaadbuzz.support.AuthSupport;
import com.yaadbuzz.support.TestMediaSupport;
import io.quarkus.test.junit.QuarkusTest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/**
 * HTTP-level tribute tests. Service-layer tests keep the persistence session open and
 * often skip avatars, so they miss LazyInitializationException when mapping DTOs after commit.
 */
@QuarkusTest
class TeamTributeResourceTest {

    @Test
    void createTributeSucceedsWhenWriterAndRecipientHaveAvatars() {
        AuthSupport.AuthSession writer = AuthSupport.register(
                "trib-w-" + UUID.randomUUID() + "@example.com", "password123", "Writer");
        AuthSupport.AuthSession recipient = AuthSupport.register(
                "trib-r-" + UUID.randomUUID() + "@example.com", "password123", "Recipient");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams",
                                Map.of("name", "Avatar Tribute Team", "brandColor", "#0F766E")),
                        200)
                .get("id")
                .toString();

        String inviteCode = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER")),
                        200)
                .get("code")
                .toString();

        String recipientMemberId = ApiClient.json(
                        ApiClient.post(
                                recipient.accessToken(),
                                "/api/teams/join",
                                Map.of("code", inviteCode, "nickname", "Recip")),
                        200)
                .get("id")
                .toString();

        UUID writerAvatarId = TestMediaSupport.createPngAsset(writer.userId(), "writer-avatar");
        UUID recipientAvatarId = TestMediaSupport.createPngAsset(recipient.userId(), "recip-avatar");

        Map<String, Object> writerProfile = ApiClient.json(
                ApiClient.patch(
                        writer.accessToken(),
                        "/api/teams/" + teamId + "/profile",
                        Map.of("avatarId", writerAvatarId.toString())),
                200);
        assertNotNull(writerProfile.get("avatar"));
        @SuppressWarnings("unchecked")
        Map<String, Object> writerAvatar = (Map<String, Object>) writerProfile.get("avatar");
        assertTrue(writerAvatar.get("url").toString().contains("writer-avatar"));

        Map<String, Object> recipientProfile = ApiClient.json(
                ApiClient.patch(
                        recipient.accessToken(),
                        "/api/teams/" + teamId + "/profile",
                        Map.of("avatarId", recipientAvatarId.toString())),
                200);
        assertNotNull(recipientProfile.get("avatar"));

        Map<String, Object> created = ApiClient.json(
                ApiClient.post(
                        writer.accessToken(),
                        "/api/teams/" + teamId + "/tributes",
                        Map.of(
                                "recipientId", recipientMemberId,
                                "text", "Praise with avatars on both sides",
                                "anonymous", false,
                                "privateTribute", false)),
                200);

        assertEquals("Praise with avatars on both sides", created.get("text"));
        assertFalse(Boolean.TRUE.equals(created.get("published")));
        assertNotNull(created.get("writer"));
        assertNotNull(created.get("recipient"));

        @SuppressWarnings("unchecked")
        Map<String, Object> writerDto = (Map<String, Object>) created.get("writer");
        @SuppressWarnings("unchecked")
        Map<String, Object> recipientDto = (Map<String, Object>) created.get("recipient");
        @SuppressWarnings("unchecked")
        Map<String, Object> createdWriterAvatar = (Map<String, Object>) writerDto.get("avatar");
        @SuppressWarnings("unchecked")
        Map<String, Object> createdRecipientAvatar = (Map<String, Object>) recipientDto.get("avatar");

        assertNotNull(createdWriterAvatar, "writer.avatar must be serialized after create");
        assertNotNull(createdRecipientAvatar, "recipient.avatar must be serialized after create");
        assertTrue(createdWriterAvatar.get("url").toString().contains("writer-avatar"));
        assertTrue(createdRecipientAvatar.get("url").toString().contains("recip-avatar"));
    }

    @Test
    void publishAndListTributeIncludeAvatars() {
        AuthSupport.AuthSession writer = AuthSupport.register(
                "trib-pw-" + UUID.randomUUID() + "@example.com", "password123", "Writer");
        AuthSupport.AuthSession recipient = AuthSupport.register(
                "trib-pr-" + UUID.randomUUID() + "@example.com", "password123", "Recipient");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams",
                                Map.of("name", "Publish Avatar Team", "brandColor", "#123456")),
                        200)
                .get("id")
                .toString();

        String inviteCode = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER")),
                        200)
                .get("code")
                .toString();

        String recipientMemberId = ApiClient.json(
                        ApiClient.post(
                                recipient.accessToken(),
                                "/api/teams/join",
                                Map.of("code", inviteCode, "nickname", "Recip")),
                        200)
                .get("id")
                .toString();

        ApiClient.json(
                ApiClient.patch(
                        writer.accessToken(),
                        "/api/teams/" + teamId + "/profile",
                        Map.of(
                                "avatarId",
                                TestMediaSupport.createPngAsset(writer.userId(), "pub-writer").toString())),
                200);
        ApiClient.json(
                ApiClient.patch(
                        recipient.accessToken(),
                        "/api/teams/" + teamId + "/profile",
                        Map.of(
                                "avatarId",
                                TestMediaSupport.createPngAsset(recipient.userId(), "pub-recip").toString())),
                200);

        String tributeId = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams/" + teamId + "/tributes",
                                Map.of(
                                        "recipientId", recipientMemberId,
                                        "text", "Ready to publish",
                                        "anonymous", false,
                                        "privateTribute", false)),
                        200)
                .get("id")
                .toString();

        Map<String, Object> published = ApiClient.json(
                ApiClient.post(recipient.accessToken(), "/api/tributes/" + tributeId + "/publish", Map.of()),
                200);
        assertTrue(Boolean.TRUE.equals(published.get("published")));
        @SuppressWarnings("unchecked")
        Map<String, Object> publishedWriter = (Map<String, Object>) published.get("writer");
        assertNotNull(publishedWriter.get("avatar"));

        Map<String, Object> list = ApiClient.json(
                ApiClient.get(
                        writer.accessToken(),
                        "/api/teams/" + teamId + "/tributes?recipientId=" + recipientMemberId + "&first=20"),
                200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) list.get("items");
        assertTrue(items.stream().anyMatch(i -> "Ready to publish".equals(i.get("text"))));
        Map<String, Object> listed = items.stream()
                .filter(i -> "Ready to publish".equals(i.get("text")))
                .findFirst()
                .orElseThrow();
        @SuppressWarnings("unchecked")
        Map<String, Object> listedRecipient = (Map<String, Object>) listed.get("recipient");
        assertNotNull(listedRecipient.get("avatar"));
    }
}
