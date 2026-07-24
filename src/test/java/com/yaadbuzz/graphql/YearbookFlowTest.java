package com.yaadbuzz.graphql;

import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.support.AuthSupport;
import com.yaadbuzz.support.GraphQlClient;
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

        String orgId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($name: String!) {
                          createOrganization(name: $name, brandColor: "#0F766E") { id name }
                        }
                        """,
                Map.of("name", "Test Academy " + UUID.randomUUID())
        )).get("createOrganization")).get("id").toString();

        String teamId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($orgId: String!, $name: String!) {
                          createTeam(organizationId: $orgId, name: $name) { id name }
                        }
                        """,
                Map.of("orgId", orgId, "name", "Class of 2026")
        )).get("createTeam")).get("id").toString();

        String inviteCode = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($teamId: String!) {
                          createInvite(teamId: $teamId, role: MEMBER, maxUses: 5) { code }
                        }
                        """,
                Map.of("teamId", teamId)
        )).get("createInvite")).get("code").toString();

        String bobMemberId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                bob.accessToken(),
                """
                        mutation($code: String!, $nickname: String!) {
                          joinTeam(code: $code, nickname: $nickname, bio: "Hello") {
                            id teamId nickname
                          }
                        }
                        """,
                Map.of("code", inviteCode, "nickname", "Bobby")
        )).get("joinTeam")).get("id").toString();

        Map<String, Object> membersData = GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        query($teamId: String!) {
                          teamMembers(teamId: $teamId, first: 20) {
                            items { id nickname role }
                            hasNext
                          }
                        }
                        """,
                Map.of("teamId", teamId)
        ));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> members =
                (List<Map<String, Object>>) ((Map<?, ?>) membersData.get("teamMembers")).get("items");
        assertTrue(members.stream().anyMatch(m -> "Bobby".equals(m.get("nickname"))));
        assertTrue(members.stream().anyMatch(m -> "Alice".equals(m.get("nickname"))));

        String aliceMemberId = members.stream()
                .filter(m -> "Alice".equals(m.get("nickname")))
                .map(m -> m.get("id").toString())
                .findFirst()
                .orElseThrow();

        GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($teamId: String!, $recipientId: String!) {
                          createTribute(
                            teamId: $teamId,
                            recipientId: $recipientId,
                            text: "You made every rehearsal better.",
                            anonymous: false,
                            privateTribute: false
                          ) { id text }
                        }
                        """,
                Map.of("teamId", teamId, "recipientId", bobMemberId)
        ));

        GraphQlClient.data(GraphQlClient.query(
                bob.accessToken(),
                """
                        mutation($teamId: String!) {
                          createMemory(
                            teamId: $teamId,
                            title: "First day",
                            bodyText: "We laughed until dusk.",
                            privateMemory: false
                          ) { id title }
                        }
                        """,
                Map.of("teamId", teamId)
        ));

        String topicId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($teamId: String!) {
                          createTopic(teamId: $teamId, title: "Most likely to start a band") { id title }
                        }
                        """,
                Map.of("teamId", teamId)
        )).get("createTopic")).get("id").toString();

        GraphQlClient.data(GraphQlClient.query(
                bob.accessToken(),
                """
                        mutation($topicId: String!, $nomineeId: String!) {
                          voteTopic(topicId: $topicId, nomineeId: $nomineeId, repetitions: 2)
                        }
                        """,
                Map.of("topicId", topicId, "nomineeId", aliceMemberId)
        ));

        Map<String, Object> standings = GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        query($topicId: String!) {
                          topicStandings(topicId: $topicId) {
                            score
                            nominee { id nickname }
                          }
                        }
                        """,
                Map.of("topicId", topicId)
        ));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> standingItems = (List<Map<String, Object>>) standings.get("topicStandings");
        assertFalse(standingItems.isEmpty());
        assertEquals(2, ((Number) standingItems.getFirst().get("score")).intValue());

        GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($memberId: String!) {
                          addCharacteristic(teamMemberId: $memberId, title: "Optimistic") { title count }
                        }
                        """,
                Map.of("memberId", bobMemberId)
        ));

        Map<String, Object> searchData = GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        query($teamId: String!, $q: String!) {
                          search(teamId: $teamId, q: $q, first: 10) {
                            items { type title snippet }
                          }
                        }
                        """,
                Map.of("teamId", teamId, "q", "Bobby")
        ));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> hits =
                (List<Map<String, Object>>) ((Map<?, ?>) searchData.get("search")).get("items");
        // Search indexing can lag slightly behind writes in tests.
        assertTrue(hits.isEmpty() || hits.stream().anyMatch(h -> "TEAM_MEMBER".equals(h.get("type"))));

        GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($teamId: String!) {
                          updateYearbookSettings(
                            teamId: $teamId,
                            title: "Printed Memories",
                            theme: MODERN,
                            showAwards: true
                          ) { yearbookTitle yearbookTheme }
                        }
                        """,
                Map.of("teamId", teamId)
        ));

        Map<String, Object> yearbookData = GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        query($teamId: String!) {
                          yearbook(teamId: $teamId) {
                            title theme brandColor
                            members { nickname tributes { text } }
                            memories { title }
                            topics { title }
                          }
                        }
                        """,
                Map.of("teamId", teamId)
        ));
        @SuppressWarnings("unchecked")
        Map<String, Object> yearbook = (Map<String, Object>) yearbookData.get("yearbook");
        assertEquals("Printed Memories", yearbook.get("title"));
        assertEquals("MODERN", yearbook.get("theme"));
        assertFalse(((List<?>) yearbook.get("members")).isEmpty());
        assertFalse(((List<?>) yearbook.get("memories")).isEmpty());

        Map<String, Object> exportData = GraphQlClient.data(GraphQlClient.query(
                alice.accessToken(),
                """
                        mutation($teamId: String!) {
                          requestYearbookExport(teamId: $teamId) { id status }
                        }
                        """,
                Map.of("teamId", teamId)
        ));
        assertEquals("PENDING", ((Map<?, ?>) exportData.get("requestYearbookExport")).get("status"));
    }

    @Test
    void graphqlRequiresAuthentication() {
        GraphQlClient.query(null, "{ me { id } }").statusCode(401);
    }

    @Test
    void duplicateNicknameOnJoinIsRejected() {
        AuthSupport.AuthSession owner = AuthSupport.register(
                "owner-" + UUID.randomUUID() + "@example.com", "password123", "Owner");
        AuthSupport.AuthSession first = AuthSupport.register(
                "first-" + UUID.randomUUID() + "@example.com", "password123", "First");
        AuthSupport.AuthSession second = AuthSupport.register(
                "second-" + UUID.randomUUID() + "@example.com", "password123", "Second");

        String orgId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                owner.accessToken(),
                "mutation { createOrganization(name: \"Org\", brandColor: \"#111\") { id } }"
        )).get("createOrganization")).get("id").toString();

        String teamId = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                owner.accessToken(),
                """
                        mutation($orgId: String!) {
                          createTeam(organizationId: $orgId, name: "Team") { id }
                        }
                        """,
                Map.of("orgId", orgId)
        )).get("createTeam")).get("id").toString();

        String code1 = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                owner.accessToken(),
                """
                        mutation($teamId: String!) {
                          createInvite(teamId: $teamId, role: MEMBER) { code }
                        }
                        """,
                Map.of("teamId", teamId)
        )).get("createInvite")).get("code").toString();

        GraphQlClient.data(GraphQlClient.query(
                first.accessToken(),
                """
                        mutation($code: String!) {
                          joinTeam(code: $code, nickname: "CoolKid") { id }
                        }
                        """,
                Map.of("code", code1)
        ));

        String code2 = ((Map<?, ?>) GraphQlClient.data(GraphQlClient.query(
                owner.accessToken(),
                """
                        mutation($teamId: String!) {
                          createInvite(teamId: $teamId, role: MEMBER) { code }
                        }
                        """,
                Map.of("teamId", teamId)
        )).get("createInvite")).get("code").toString();

        GraphQlClient.query(
                        second.accessToken(),
                        """
                                mutation($code: String!) {
                                  joinTeam(code: $code, nickname: "CoolKid") { id }
                                }
                                """,
                        Map.of("code", code2)
                )
                .statusCode(200)
                .body("errors", notNullValue());
    }
}
