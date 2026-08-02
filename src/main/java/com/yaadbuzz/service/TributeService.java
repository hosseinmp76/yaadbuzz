package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.common.CursorPage;
import com.yaadbuzz.common.CursorUtil;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.TributeReport;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.TeamRole;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.Hibernate;

@ApplicationScoped
public class TributeService {

    @Inject
    AccessService accessService;

    @Transactional
    public Tribute create(UUID teamId, User user, UUID recipientId, String text, boolean anonymous, boolean privateTribute) {
        TeamMember writer = accessService.requireTeamMember(teamId, user);
        TeamMember recipient = TeamMember.findActiveById(recipientId)
                .orElseThrow(() -> ApiException.notFound("Recipient not found"));
        if (!recipient.team.id.equals(teamId)) {
            throw ApiException.badRequest("Recipient must be in the same team");
        }
        if (writer.id.equals(recipient.id)) {
            throw ApiException.badRequest("Cannot write a tribute to yourself");
        }
        if (text == null || text.isBlank()) {
            throw ApiException.badRequest("Tribute text is required");
        }
        Tribute tribute = new Tribute();
        tribute.team = writer.team;
        tribute.writer = writer;
        tribute.recipient = recipient;
        tribute.text = text.trim();
        tribute.anonymous = anonymous;
        tribute.privateTribute = privateTribute;
        tribute.persist();
        return tribute;
    }

    @Transactional
    public CursorPage<Tribute> list(UUID teamId, User user, UUID recipientId, Integer first, String after) {
        TeamMember viewer = accessService.requireTeamMember(teamId, user);
        Team team = accessService.requireTeam(teamId);
        int limit = first == null || first < 1 || first > 50 ? 20 : first;
        CursorUtil.Cursor cursor = CursorUtil.decode(after);

        StringBuilder ql = new StringBuilder("team.id = ?1 and deletedAt is null and hidden = false");
        List<Object> params = new ArrayList<>();
        params.add(teamId);
        int idx = 2;
        if (recipientId != null) {
            ql.append(" and recipient.id = ?").append(idx++);
            params.add(recipientId);
        }
        if (cursor != null) {
            ql.append(" and (createdAt < ?").append(idx++)
                    .append(" or (createdAt = ?").append(idx++)
                    .append(" and id < ?").append(idx++).append("))");
            params.add(cursor.createdAt());
            params.add(cursor.createdAt());
            params.add(cursor.id());
        }
        ql.append(" order by createdAt desc, id desc");

        List<Tribute> rows = Tribute.find(ql.toString(), params.toArray()).page(0, limit * 3).list();
        List<Tribute> visible = rows.stream()
                .filter(t -> accessService.canViewTribute(team, viewer, t))
                .limit(limit + 1L)
                .toList();
        boolean hasNext = visible.size() > limit;
        List<Tribute> page = hasNext ? visible.subList(0, limit) : visible;
        for (Tribute tribute : page) {
            Hibernate.initialize(tribute.pictures);
            Hibernate.initialize(tribute.team);
            Hibernate.initialize(tribute.writer);
            Hibernate.initialize(tribute.writer.team);
            Hibernate.initialize(tribute.writer.user);
            if (tribute.writer.avatar != null) {
                Hibernate.initialize(tribute.writer.avatar);
            }
            Hibernate.initialize(tribute.recipient);
            Hibernate.initialize(tribute.recipient.team);
            Hibernate.initialize(tribute.recipient.user);
            if (tribute.recipient.avatar != null) {
                Hibernate.initialize(tribute.recipient.avatar);
            }
        }
        String next = null;
        if (hasNext && !page.isEmpty()) {
            Tribute last = page.get(page.size() - 1);
            next = CursorUtil.encode(last.createdAt, last.id);
        }
        return new CursorPage<>(page, next, hasNext);
    }

    @Transactional
    public TributeReport report(UUID tributeId, User user, String reason) {
        Tribute tribute = Tribute.findById(tributeId);
        if (tribute == null || tribute.isDeleted()) {
            throw ApiException.notFound("Tribute not found");
        }
        TeamMember reporter = accessService.requireTeamMember(tribute.team.id, user);
        if (reason == null || reason.isBlank()) {
            throw ApiException.badRequest("Reason is required");
        }
        TributeReport report = new TributeReport();
        report.tribute = tribute;
        report.reporter = reporter;
        report.reason = reason.trim();
        report.persist();
        return report;
    }

    @Transactional
    public Tribute hide(UUID tributeId, User user) {
        Tribute tribute = Tribute.findById(tributeId);
        if (tribute == null || tribute.isDeleted()) {
            throw ApiException.notFound("Tribute not found");
        }
        TeamMember admin = accessService.requireTeamAdmin(tribute.team.id, user);
        if (admin.role != TeamRole.ADMIN) {
            // requireTeamAdmin already validates org admin path
        }
        tribute.hidden = true;
        Hibernate.initialize(tribute.pictures);
        return tribute;
    }
}
