package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Characteristic;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CharacteristicService {

    @Inject
    AccessService accessService;

    @Transactional
    public Characteristic add(UUID teamMemberId, User user, String title) {
        TeamMember target = TeamMember.findActiveById(teamMemberId)
                .orElseThrow(() -> ApiException.notFound("Team member not found"));
        accessService.requireTeamMember(target.team.id, user);
        if (title == null || title.isBlank()) {
            throw ApiException.badRequest("Characteristic title is required");
        }
        String normalized = title.trim();
        Characteristic characteristic = Characteristic.findByMemberAndTitle(teamMemberId, normalized)
                .orElseGet(() -> {
                    Characteristic c = new Characteristic();
                    c.teamMember = target;
                    c.title = normalized;
                    c.count = 0;
                    c.persist();
                    return c;
                });
        characteristic.count += 1;
        return characteristic;
    }

    public List<Characteristic> listForMember(UUID teamMemberId, User user) {
        TeamMember target = TeamMember.findActiveById(teamMemberId)
                .orElseThrow(() -> ApiException.notFound("Team member not found"));
        accessService.requireTeamMember(target.team.id, user);
        return Characteristic.list("teamMember.id = ?1 order by count desc, title asc", teamMemberId);
    }
}
