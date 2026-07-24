package com.yaadbuzz.config;

import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.OrganizationMembership;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.OrgRole;
import com.yaadbuzz.enums.TeamRole;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class SeedData {

    @ConfigProperty(name = "yaadbuzz.seed.enabled", defaultValue = "false")
    boolean seedEnabled;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (!seedEnabled) {
            return;
        }
        if (User.count() > 0) {
            return;
        }
        User alice = user("alice@yaadbuzz.local", "password123", "Alice");
        User bob = user("bob@yaadbuzz.local", "password123", "Bob");
        User cara = user("cara@yaadbuzz.local", "password123", "Cara");

        Organization org = new Organization();
        org.name = "Northwind Academy";
        org.brandColor = "#0F766E";
        org.owner = alice;
        org.persist();

        membership(org, alice, OrgRole.OWNER);
        membership(org, bob, OrgRole.MEMBER);
        membership(org, cara, OrgRole.MEMBER);

        Team team = new Team();
        team.organization = org;
        team.name = "Class of 2026";
        team.brandColor = "#0F766E";
        team.persist();

        TeamMember aliceMember = member(team, alice, "Ally", TeamRole.ADMIN);
        TeamMember bobMember = member(team, bob, "Bobby", TeamRole.MEMBER);
        TeamMember caraMember = member(team, cara, "Cee", TeamRole.MEMBER);

        Topic topic = new Topic();
        topic.team = team;
        topic.title = "Most likely to start a band";
        topic.persist();

        // keep references used so compiler doesn't complain about unused locals in seed
        aliceMember.bio = "Always organizing reunions.";
        bobMember.bio = "Coffee enthusiast and storyteller.";
        caraMember.bio = "Quiet observer with loud laughter.";
    }

    private User user(String email, String password, String displayName) {
        User user = new User();
        user.email = email;
        user.passwordHash = BcryptUtil.bcryptHash(password);
        user.displayName = displayName;
        user.persist();
        return user;
    }

    private void membership(Organization org, User user, OrgRole role) {
        OrganizationMembership membership = new OrganizationMembership();
        membership.organization = org;
        membership.user = user;
        membership.role = role;
        membership.persist();
    }

    private TeamMember member(Team team, User user, String nickname, TeamRole role) {
        TeamMember member = new TeamMember();
        member.team = team;
        member.user = user;
        member.nickname = nickname;
        member.role = role;
        member.persist();
        return member;
    }
}
