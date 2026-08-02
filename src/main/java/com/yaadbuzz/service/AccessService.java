package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.OrganizationMembership;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.OrgRole;
import com.yaadbuzz.enums.TeamRole;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.EnumSet;
import java.util.UUID;

@ApplicationScoped
public class AccessService {

    public Organization requireOrganization(UUID id) {
        Organization org = Organization.findById(id);
        if (org == null || org.isDeleted()) {
            throw ApiException.notFound("Organization not found");
        }
        return org;
    }

    public Team requireTeam(UUID id) {
        // Fetch coverMedia so API mapping can read url/mimeType after the session closes.
        Team team = Team.find(
                        "from Team t left join fetch t.coverMedia left join fetch t.organization where t.id = ?1",
                        id)
                .firstResult();
        if (team == null || team.isDeleted()) {
            throw ApiException.notFound("Team not found");
        }
        return team;
    }

    public OrganizationMembership requireOrgMember(UUID orgId, User user) {
        return OrganizationMembership.findByOrgAndUser(orgId, user.id)
                .orElseThrow(() -> ApiException.forbidden("Not a member of this organization"));
    }

    public void requireOrgAdmin(UUID orgId, User user) {
        OrganizationMembership membership = requireOrgMember(orgId, user);
        if (!EnumSet.of(OrgRole.OWNER, OrgRole.ADMIN).contains(membership.role)) {
            throw ApiException.forbidden("Organization admin role required");
        }
    }

    public TeamMember requireTeamMember(UUID teamId, User user) {
        return TeamMember.findByTeamAndUser(teamId, user.id)
                .orElseThrow(() -> ApiException.forbidden("Not a member of this team"));
    }

    public TeamMember requireTeamAdmin(UUID teamId, User user) {
        TeamMember member = requireTeamMember(teamId, user);
        if (member.role != TeamRole.ADMIN) {
            // Org admins can also manage teams they belong to, and org owners of the parent org
            OrganizationMembership orgMembership = OrganizationMembership
                    .findByOrgAndUser(member.team.organization.id, user.id)
                    .orElse(null);
            if (orgMembership == null || !EnumSet.of(OrgRole.OWNER, OrgRole.ADMIN).contains(orgMembership.role)) {
                throw ApiException.forbidden("Team admin role required");
            }
        }
        return member;
    }

    public boolean canViewTribute(Team team, TeamMember viewer, com.yaadbuzz.domain.Tribute tribute) {
        if (tribute.isDeleted()) {
            return false;
        }
        if (tribute.writer.id.equals(viewer.id) || tribute.recipient.id.equals(viewer.id)) {
            return true;
        }
        // Unpublished or private tributes stay between writer and recipient.
        if (tribute.hidden || tribute.privateTribute) {
            return false;
        }
        return true;
    }
}
