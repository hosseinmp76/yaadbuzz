package com.yaadbuzz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
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

    @Inject
    OrganizationService organizationService;

    @Test
    @Transactional
    void cannotWriteTributeToSelf() {
        User user = User.findByEmail(createUserEmail()).orElseThrow();
        var org = organizationService.create(user, "Tribute Org", "#123456");
        Team team = teamService.create(user, org.id, "Tribute Team", null);
        TeamMember member = TeamMember.findByTeamAndUser(team.id, user.id).orElseThrow();

        ApiException ex = assertThrows(ApiException.class, () -> tributeService.create(
                team.id, user, member.id, "Nope", false, false
        ));
        assertEquals(400, ex.status);
    }

    @Test
    void sealedTributeHiddenFromRecipientViaApi() {
        AuthSupport.AuthSession writer = AuthSupport.register(
                "writer-" + UUID.randomUUID() + "@example.com", "password123", "Writer");
        AuthSupport.AuthSession recipient = AuthSupport.register(
                "recip-" + UUID.randomUUID() + "@example.com", "password123", "Recipient");

        String orgId = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/organizations",
                                Map.of("name", "Seal Org", "brandColor", "#123456")),
                        200)
                .get("id")
                .toString();

        String teamId = ApiClient.json(
                        ApiClient.post(
                                writer.accessToken(),
                                "/api/organizations/" + orgId + "/teams",
                                Map.of("name", "Seal Team", "brandColor", "#123456")),
                        200)
                .get("id")
                .toString();

        String code = ApiClient.json(
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
                                Map.of("code", code, "nickname", "Recip")),
                        200)
                .get("id")
                .toString();

        ApiClient.json(
                ApiClient.post(
                        writer.accessToken(),
                        "/api/teams/" + teamId + "/tributes",
                        Map.of(
                                "recipientId", recipientMemberId,
                                "text", "Secret praise",
                                "anonymous", false,
                                "privateTribute", false)),
                200);

        Map<String, Object> recipientView = ApiClient.json(
                ApiClient.get(
                        recipient.accessToken(),
                        "/api/teams/" + teamId + "/tributes?recipientId=" + recipientMemberId + "&first=20"),
                200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) recipientView.get("items");
        assertTrue(items.isEmpty());

        ApiClient.json(
                ApiClient.patch(
                        writer.accessToken(),
                        "/api/teams/" + teamId,
                        Map.of("revealTributes", true)),
                200);

        Map<String, Object> revealedView = ApiClient.json(
                ApiClient.get(
                        recipient.accessToken(),
                        "/api/teams/" + teamId + "/tributes?recipientId=" + recipientMemberId + "&first=20"),
                200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> revealed = (List<Map<String, Object>>) revealedView.get("items");
        assertTrue(revealed.stream().anyMatch(i -> "Secret praise".equals(i.get("text"))));
    }

    private String createUserEmail() {
        String email = "svc-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "SvcUser");
        return email;
    }
}
