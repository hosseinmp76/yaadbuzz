package com.yaadbuzz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.support.ApiClient;
import com.yaadbuzz.support.AuthSupport;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

@QuarkusTest
class TributeServiceTest {

    @Inject
    TributeService tributeService;

    @Inject
    TeamService teamService;

    @Test
    @Transactional
    void cannotWriteAnonymousTributeToSelf() {
        User user = User.findByEmail(createUserEmail()).orElseThrow();
        Team team = teamService.create(user, "Tribute Team", null);
        TeamMember member = TeamMember.findByTeamAndUser(team.id, user.id).orElseThrow();

        ApiException ex = assertThrows(ApiException.class, () -> tributeService.create(
                team.id, user, member.id, "Nope", true, false
        ));
        assertEquals(400, ex.status);

        Tribute self = tributeService.create(team.id, user, member.id, "For me", false, false);
        assertFalse(self.anonymous);
        assertEquals(member.id, self.recipient.id);
    }

    @Test
    void tributeStartsUnpublishedUntilRecipientPublishes() {
        AuthSupport.AuthSession writer = AuthSupport.register(
                "writer-" + UUID.randomUUID() + "@example.com", "password123", "Writer");
        AuthSupport.AuthSession recipient = AuthSupport.register(
                "recip-" + UUID.randomUUID() + "@example.com", "password123", "Recipient");
        AuthSupport.AuthSession other = AuthSupport.register(
                "other-" + UUID.randomUUID() + "@example.com", "password123", "Other");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams",
                                Map.of("name", "Publish Team", "brandColor", "#123456")),
                        200)
                .get("id")
                .toString();

        String codeRecip = ApiClient.json(
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
                                Map.of("code", codeRecip, "nickname", "Recip")),
                        200)
                .get("id")
                .toString();

        String codeOther = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER")),
                        200)
                .get("code")
                .toString();
        ApiClient.json(
                ApiClient.post(
                        other.accessToken(),
                        "/api/teams/join",
                        Map.of("code", codeOther, "nickname", "Other")),
                200);

        Map<String, Object> created = ApiClient.json(
                ApiClient.post(
                        writer.accessToken(),
                        "/api/teams/" + teamId + "/tributes",
                        Map.of(
                                "recipientId", recipientMemberId,
                                "text", "Secret praise",
                                "anonymous", false,
                                "privateTribute", false)),
                200);
        assertFalse(Boolean.TRUE.equals(created.get("published")));
        String tributeId = created.get("id").toString();

        Map<String, Object> otherView = ApiClient.json(
                ApiClient.get(
                        other.accessToken(),
                        "/api/teams/" + teamId + "/tributes?recipientId=" + recipientMemberId + "&first=20"),
                200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsBefore = (List<Map<String, Object>>) otherView.get("items");
        assertTrue(itemsBefore.isEmpty());

        Map<String, Object> published = ApiClient.json(
                ApiClient.post(recipient.accessToken(), "/api/tributes/" + tributeId + "/publish", Map.of()),
                200);
        assertTrue(Boolean.TRUE.equals(published.get("published")));

        Map<String, Object> otherViewAfter = ApiClient.json(
                ApiClient.get(
                        other.accessToken(),
                        "/api/teams/" + teamId + "/tributes?recipientId=" + recipientMemberId + "&first=20"),
                200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsAfter = (List<Map<String, Object>>) otherViewAfter.get("items");
        assertTrue(itemsAfter.stream().anyMatch(i -> "Secret praise".equals(i.get("text"))));
    }

    private String createUserEmail() {
        String email = "svc-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "SvcUser");
        return email;
    }
}
