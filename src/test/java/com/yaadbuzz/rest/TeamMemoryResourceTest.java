package com.yaadbuzz.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

@QuarkusTest
class TeamMemoryResourceTest {

    @Test
    void createMemorySucceedsWhenWriterHasAvatar() {
        AuthSupport.AuthSession author = AuthSupport.register(
                "mem-a-" + UUID.randomUUID() + "@example.com", "password123", "Author");

        String teamId = ApiClient.json(
                        ApiClient.post(
                                author.accessToken(),
                                "/api/teams",
                                Map.of("name", "Avatar Memory Team", "brandColor", "#0F766E")),
                        200)
                .get("id")
                .toString();

        ApiClient.json(
                ApiClient.patch(
                        author.accessToken(),
                        "/api/teams/" + teamId + "/profile",
                        Map.of(
                                "avatarId",
                                TestMediaSupport.createPngAsset(author.userId(), "mem-writer").toString())),
                200);

        Map<String, Object> created = ApiClient.json(
                ApiClient.post(
                        author.accessToken(),
                        "/api/teams/" + teamId + "/memories",
                        Map.of(
                                "title", "Campfire",
                                "bodyText", "We sang until midnight.",
                                "privateMemory", false)),
                200);

        assertEquals("Campfire", created.get("title"));
        assertEquals("We sang until midnight.", created.get("bodyText"));
        @SuppressWarnings("unchecked")
        Map<String, Object> writer = (Map<String, Object>) created.get("writer");
        assertNotNull(writer);
        assertNotNull(writer.get("avatar"), "writer.avatar must be serialized after memory create");
        @SuppressWarnings("unchecked")
        Map<String, Object> avatar = (Map<String, Object>) writer.get("avatar");
        assertTrue(avatar.get("url").toString().contains("mem-writer"));

        Map<String, Object> list = ApiClient.json(
                ApiClient.get(author.accessToken(), "/api/teams/" + teamId + "/memories?first=10"), 200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) list.get("items");
        assertTrue(items.stream().anyMatch(i -> "Campfire".equals(i.get("title"))));
    }
}
