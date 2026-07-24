package com.yaadbuzz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.support.AuthSupport;
import com.yaadbuzz.support.GraphQlClient;
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
    void sealedTributeHiddenFromRecipientViaGraphql() {
        AuthSupport.AuthSession writer = AuthSupport.register(
                "writer-" + UUID.randomUUID() + "@example.com", "password123", "Writer");
        AuthSupport.AuthSession recipient = AuthSupport.register(
                "recip-" + UUID.randomUUID() + "@example.com", "password123", "Recipient");

        String orgId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                writer.accessToken(),
                "mutation { createOrganization(name: \"Seal Org\") { id } }"
        )).get("createOrganization")).get("id").toString();

        String teamId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                writer.accessToken(),
                """
                        mutation($orgId: String!) {
                          createTeam(organizationId: $orgId, name: "Seal Team") { id }
                        }
                        """,
                Map.of("orgId", orgId)
        )).get("createTeam")).get("id").toString();

        String code = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                writer.accessToken(),
                """
                        mutation($teamId: String!) {
                          createInvite(teamId: $teamId, role: MEMBER) { code }
                        }
                        """,
                Map.of("teamId", teamId)
        )).get("createInvite")).get("code").toString();

        String recipientMemberId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                recipient.accessToken(),
                """
                        mutation($code: String!) {
                          joinTeam(code: $code, nickname: "Recip") { id }
                        }
                        """,
                Map.of("code", code)
        )).get("joinTeam")).get("id").toString();

        GraphQlClient.data(GraphQlClient.query(
                writer.accessToken(),
                """
                        mutation($teamId: String!, $recipientId: String!) {
                          createTribute(
                            teamId: $teamId,
                            recipientId: $recipientId,
                            text: "Secret praise",
                            anonymous: false,
                            privateTribute: false
                          ) { id }
                        }
                        """,
                Map.of("teamId", teamId, "recipientId", recipientMemberId)
        ));

        Map<String, Object> recipientView = GraphQlClient.data(GraphQlClient.query(
                recipient.accessToken(),
                """
                        query($teamId: String!, $recipientId: String!) {
                          tributes(teamId: $teamId, recipientId: $recipientId, first: 20) {
                            items { text }
                          }
                        }
                        """,
                Map.of("teamId", teamId, "recipientId", recipientMemberId)
        ));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items =
                (List<Map<String, Object>>) ((Map<?, ?>) recipientView.get("tributes")).get("items");
        assertTrue(items.isEmpty());

        GraphQlClient.data(GraphQlClient.query(
                writer.accessToken(),
                """
                        mutation($teamId: String!) {
                          updateTeamSettings(teamId: $teamId, revealTributes: true) {
                            tributesRevealed
                          }
                        }
                        """,
                Map.of("teamId", teamId)
        ));

        Map<String, Object> revealedView = GraphQlClient.data(GraphQlClient.query(
                recipient.accessToken(),
                """
                        query($teamId: String!, $recipientId: String!) {
                          tributes(teamId: $teamId, recipientId: $recipientId, first: 20) {
                            items { text }
                          }
                        }
                        """,
                Map.of("teamId", teamId, "recipientId", recipientMemberId)
        ));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> revealed =
                (List<Map<String, Object>>) ((Map<?, ?>) revealedView.get("tributes")).get("items");
        assertTrue(revealed.stream().anyMatch(i -> "Secret praise".equals(i.get("text"))));
    }

    private String createUserEmail() {
        String email = "svc-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "SvcUser");
        return email;
    }
}
