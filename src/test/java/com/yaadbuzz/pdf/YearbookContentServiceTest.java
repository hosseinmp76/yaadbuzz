package com.yaadbuzz.pdf;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.YearbookTheme;
import com.yaadbuzz.service.MemoryService;
import com.yaadbuzz.service.OrganizationService;
import com.yaadbuzz.service.TeamService;
import com.yaadbuzz.support.AuthSupport;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

@QuarkusTest
class YearbookContentServiceTest {

    @Inject
    YearbookContentService yearbookContentService;

    @Inject
    OrganizationService organizationService;

    @Inject
    TeamService teamService;

    @Inject
    MemoryService memoryService;

    @Test
    @Transactional
    void assemblesCustomizedYearbookForOnlineView() {
        String email = "yb-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "YbUser");
        User user = User.findByEmail(email).orElseThrow();

        var org = organizationService.create(user, "Yb Org", "#0F766E");
        var team = teamService.create(user, org.id, "Yb Team", "#B45309");
        memoryService.create(team.id, user, "Campfire", "We stayed up late.", false, List.of());

        teamService.updateYearbookSettings(
                team.id,
                user,
                "Class of Forever",
                "A night to remember",
                "For everyone who showed up.",
                YearbookTheme.SCRAPBOOK,
                true,
                true,
                false,
                true,
                false);

        YearbookContent content = yearbookContentService.loadForTeam(team.id, user);

        assertEquals("Class of Forever", content.title());
        assertEquals("A night to remember", content.subtitle());
        assertEquals("For everyone who showed up.", content.dedication());
        assertEquals("SCRAPBOOK", content.theme());
        assertEquals("#B45309", content.brandColor());
        assertTrue(content.showMembers());
        assertTrue(content.showTributes());
        assertFalse(content.showCharacteristics());
        assertTrue(content.showMemories());
        assertFalse(content.showAwards());
        assertEquals(1, content.memories().size());
        assertEquals("Campfire", content.memories().getFirst().title());
    }
}
