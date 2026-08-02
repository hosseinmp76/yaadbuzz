package com.yaadbuzz.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.enums.TeamRole;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AccessServiceTributeVisibilityTest {

    private final AccessService accessService = new AccessService();

    private Team team;
    private TeamMember writer;
    private TeamMember recipient;
    private TeamMember admin;
    private TeamMember other;
    private Tribute tribute;

    @BeforeEach
    void setUp() {
        team = new Team();
        team.id = UUID.randomUUID();
        team.revealTributes = false;

        writer = member(TeamRole.MEMBER);
        recipient = member(TeamRole.MEMBER);
        admin = member(TeamRole.ADMIN);
        other = member(TeamRole.MEMBER);

        tribute = new Tribute();
        tribute.id = UUID.randomUUID();
        tribute.writer = writer;
        tribute.recipient = recipient;
        tribute.hidden = false;
        tribute.privateTribute = false;
        tribute.anonymous = false;
        tribute.text = "Great teammate";
    }

    @Test
    void writerCanAlwaysViewOwnTribute() {
        assertTrue(accessService.canViewTribute(team, writer, tribute));
    }

    @Test
    void recipientCannotViewUntilRevealed() {
        assertFalse(accessService.canViewTribute(team, recipient, tribute));

        team.revealTributes = true;
        assertTrue(accessService.canViewTribute(team, recipient, tribute));
    }

    @Test
    void otherMembersCanViewPublicTributeEvenWhenSealed() {
        assertTrue(accessService.canViewTribute(team, other, tribute));
    }

    @Test
    void privateTributeVisibleOnlyToWriterAndRecipient() {
        tribute.privateTribute = true;
        team.revealTributes = true;

        assertTrue(accessService.canViewTribute(team, writer, tribute));
        assertTrue(accessService.canViewTribute(team, recipient, tribute));
        assertFalse(accessService.canViewTribute(team, other, tribute));
        assertFalse(accessService.canViewTribute(team, admin, tribute));
    }

    @Test
    void hiddenTributeIsInvisible() {
        tribute.hidden = true;
        team.revealTributes = true;

        assertFalse(accessService.canViewTribute(team, writer, tribute));
        assertFalse(accessService.canViewTribute(team, recipient, tribute));
        assertFalse(accessService.canViewTribute(team, admin, tribute));
    }

    @Test
    void softDeletedTributeIsInvisible() {
        tribute.softDelete();
        team.revealTributes = true;

        assertFalse(accessService.canViewTribute(team, writer, tribute));
    }

    private static TeamMember member(TeamRole role) {
        TeamMember member = new TeamMember();
        member.id = UUID.randomUUID();
        member.role = role;
        member.nickname = role.name() + "-" + member.id.toString().substring(0, 8);
        return member;
    }
}
