package com.yaadbuzz.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.support.ApiClient;
import com.yaadbuzz.support.AuthSupport;
import io.quarkus.test.junit.QuarkusTest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

@QuarkusTest
class CharacteristicSelfDeletionTest {

    @Test
    void memberCanDeleteOwnCharacteristicButAdminCannotDeleteIt() {
        AuthSupport.AuthSession admin = AuthSupport.register(
                "characteristic-admin-" + UUID.randomUUID() + "@example.com", "password123", "Admin");
        AuthSupport.AuthSession member = AuthSupport.register(
                "characteristic-member-" + UUID.randomUUID() + "@example.com", "password123", "Member");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                admin.accessToken(),
                                "/api/teams",
                                Map.of("name", "Self-moderated yearbook", "brandColor", "#0F766E")),
                        200)
                .get("id")
                .toString();

        String inviteCode = ApiClient.json(
                        ApiClient.post(
                                admin.accessToken(),
                                "/api/teams/" + teamId + "/invites",
                                Map.of("role", "MEMBER")),
                        200)
                .get("code")
                .toString();

        String memberId = ApiClient.json(
                        ApiClient.post(
                                member.accessToken(),
                                "/api/teams/join",
                                Map.of("code", inviteCode, "nickname", "Team member")),
                        200)
                .get("id")
                .toString();

        String characteristicId = ApiClient.json(
                        ApiClient.post(
                                admin.accessToken(),
                                "/api/members/" + memberId + "/characteristics",
                                Map.of("title", "Unwanted tag")),
                        200)
                .get("id")
                .toString();

        Map<String, Object> secondVote = ApiClient.json(
                ApiClient.post(
                        admin.accessToken(),
                        "/api/members/" + memberId + "/characteristics",
                        Map.of("title", "Unwanted tag")),
                200);
        assertEquals(characteristicId, secondVote.get("id").toString());
        assertEquals(2, ((Number) secondVote.get("count")).intValue());

        ApiClient.delete(
                        admin.accessToken(),
                        "/api/members/" + memberId + "/characteristics/" + characteristicId)
                .statusCode(403);

        ApiClient.delete(
                        member.accessToken(),
                        "/api/members/" + memberId + "/characteristics/" + characteristicId)
                .statusCode(200);

        List<?> afterMemberDelete = ApiClient.get(
                        member.accessToken(),
                        "/api/members/" + memberId + "/characteristics")
                .statusCode(200)
                .extract()
                .as(List.class);
        assertTrue(afterMemberDelete.isEmpty());
    }
}
