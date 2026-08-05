package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.TeamRole;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class AccessService {

    public Team requireTeam(UUID id) {
        // Fetch coverMedia so API mapping can read url/mimeType after the session closes.
        Team team = Team.find(
                        "from Team t left join fetch t.coverMedia where t.id = ?1",
                        id)
                .firstResult();
        if (team == null || team.isDeleted()) {
            throw ApiException.notFound("Team not found");
        }
        return team;
    }

    public TeamMember requireTeamMember(UUID teamId, User user) {
        return TeamMember.findByTeamAndUser(teamId, user.id)
                .orElseThrow(() -> ApiException.forbidden("Not a member of this team"));
    }

    public TeamMember requireTeamAdmin(UUID teamId, User user) {
        TeamMember member = requireTeamMember(teamId, user);
        if (member.role != TeamRole.ADMIN) {
            throw ApiException.forbidden("Team admin role required");
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
