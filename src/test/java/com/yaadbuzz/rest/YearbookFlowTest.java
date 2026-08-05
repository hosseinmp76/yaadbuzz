package com.yaadbuzz.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.support.ApiClient;
import com.yaadbuzz.support.AuthSupport;
import io.quarkus.test.junit.QuarkusTest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

@QuarkusTest
class YearbookFlowTest {

    @Test
    void orgTeamInviteTributeMemoryTopicAndSearch() {
        AuthSupport.AuthSession alice = AuthSupport.register(
                "alice-" + UUID.randomUUID() + "@example.com", "password123", "Alice");
        AuthSupport.AuthSession bob = AuthSupport.register(
                "bob-" + UUID.randomUUID() + "@example.com", "password123", "Bob");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                alice.accessToken(),
                                "/api/teams",
                                Map.of("name", "Class of 2026", "brandColor", "#0F766E")),
                        200)
                .get("id")
                .toString();

        String inviteCode = ApiClient.json(
                        ApiClient.post(
                                alice.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER", "maxUses", 5)),
                        200)
                .get("code")
                .toString();

        String bobMemberId = ApiClient.json(
                        ApiClient.post(
                                bob.accessToken(),
                                "/api/teams/join",
                                Map.of("code", inviteCode, "nickname", "Bobby", "bio", "Hello")),
                        200)
                .get("id")
                .toString();

        Map<String, Object> membersPage = ApiClient.json(
                ApiClient.get(alice.accessToken(), "/api/teams/" + teamId + "/members?first=20"), 200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> members = (List<Map<String, Object>>) membersPage.get("items");
        assertTrue(members.stream().anyMatch(m -> "Bobby".equals(m.get("nickname"))));
        assertTrue(members.stream().anyMatch(m -> "Alice".equals(m.get("nickname"))));

        String aliceMemberId = members.stream()
                .filter(m -> "Alice".equals(m.get("nickname")))
                .map(m -> m.get("id").toString())
                .findFirst()
                .orElseThrow();

        ApiClient.json(
                ApiClient.post(
                        alice.accessToken(),
                        "/api/teams/" + teamId + "/tributes",
                        Map.of(
                                "recipientId", bobMemberId,
                                "text", "You made every rehearsal better.",
                                "anonymous", false,
                                "privateTribute", false)),
                200);

        ApiClient.json(
                ApiClient.post(
                        bob.accessToken(),
                        "/api/teams/" + teamId + "/memories",
                        Map.of(
                                "title", "First day",
                                "bodyText", "We laughed until dusk.",
                                "privateMemory", false)),
                200);

        String topicId = ApiClient.json(
                        ApiClient.post(
                                alice.accessToken(),
                                "/api/teams/" + teamId + "/topics",
                                Map.of("title", "Most likely to start a band")),
                        200)
                .get("id")
                .toString();

        ApiClient.json(
                ApiClient.post(
                        bob.accessToken(),
                        "/api/topics/" + topicId + "/votes",
                        Map.of("nomineeId", aliceMemberId, "repetitions", 2)),
                200);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> standingItems = ApiClient.get(
                        alice.accessToken(), "/api/topics/" + topicId + "/standings")
                .statusCode(200)
                .extract()
                .as(List.class);
        assertFalse(standingItems.isEmpty());
        assertEquals(2, ((Number) standingItems.getFirst().get("score")).intValue());

        ApiClient.json(
                ApiClient.post(
                        alice.accessToken(),
                        "/api/members/" + bobMemberId + "/characteristics",
                        Map.of("title", "Optimistic")),
                200);

        Map<String, Object> searchPage = ApiClient.json(
                ApiClient.get(alice.accessToken(), "/api/teams/" + teamId + "/search?q=Bobby&first=10"),
                200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> hits = (List<Map<String, Object>>) searchPage.get("items");
        assertTrue(hits.isEmpty() || hits.stream().anyMatch(h -> "TEAM_MEMBER".equals(h.get("type"))));

        ApiClient.json(
                ApiClient.patch(
                        alice.accessToken(),
                        "/api/teams/" + teamId + "/yearbook-settings",
                        Map.of("title", "Printed Memories", "theme", "MODERN", "showAwards", true)),
                200);

        Map<String, Object> yearbook = ApiClient.json(
                ApiClient.get(alice.accessToken(), "/api/teams/" + teamId + "/yearbook"), 200);
        assertEquals("Printed Memories", yearbook.get("title"));
        assertEquals("MODERN", yearbook.get("theme"));
        assertFalse(((List<?>) yearbook.get("members")).isEmpty());
        assertFalse(((List<?>) yearbook.get("memories")).isEmpty());
    }

    @Test
    void domainApiRequiresAuthentication() {
        ApiClient.get(null, "/api/me").statusCode(401);
    }

    @Test
    void duplicateNicknameOnJoinIsRejected() {
        AuthSupport.AuthSession owner = AuthSupport.register(
                "owner-" + UUID.randomUUID() + "@example.com", "password123", "Owner");
        AuthSupport.AuthSession first = AuthSupport.register(
                "first-" + UUID.randomUUID() + "@example.com", "password123", "First");
        AuthSupport.AuthSession second = AuthSupport.register(
                "second-" + UUID.randomUUID() + "@example.com", "password123", "Second");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                owner.accessToken(),
                                "/api/teams",
                                Map.of("name", "Team", "brandColor", "#111111")),
                        200)
                .get("id")
                .toString();

        String code1 = ApiClient.json(
                        ApiClient.post(
                                owner.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER")),
                        200)
                .get("code")
                .toString();

        ApiClient.json(
                ApiClient.post(
                        first.accessToken(),
                        "/api/teams/join",
                        Map.of("code", code1, "nickname", "CoolKid")),
                200);

        String code2 = ApiClient.json(
                        ApiClient.post(
                                owner.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER")),
                        200)
                .get("code")
                .toString();

        ApiClient.post(
                        second.accessToken(),
                        "/api/teams/join",
                        Map.of("code", code2, "nickname", "CoolKid"))
                .statusCode(409);
    }
}
