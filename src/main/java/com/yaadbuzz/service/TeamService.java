package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.common.CursorPage;
import com.yaadbuzz.common.CursorUtil;
import com.yaadbuzz.domain.Invite;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.OrganizationMembership;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.InviteStatus;
import com.yaadbuzz.enums.OrgRole;
import com.yaadbuzz.enums.TeamRole;
import com.yaadbuzz.enums.YearbookTheme;
import com.yaadbuzz.mail.EmailService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.Hibernate;

@ApplicationScoped
public class TeamService {

    @Inject
    AccessService accessService;

    @Inject
    EmailService emailService;

    @Transactional
    public Team create(User user, UUID organizationId, String name, String brandColor) {
        accessService.requireOrgAdmin(organizationId, user);
        Organization org = accessService.requireOrganization(organizationId);
        if (name == null || name.isBlank()) {
            throw ApiException.badRequest("Team name is required");
        }
        Team team = new Team();
        team.organization = org;
        team.name = name.trim();
        team.brandColor = brandColor;
        team.persist();

        TeamMember member = new TeamMember();
        member.team = team;
        member.user = user;
        member.nickname = uniqueNickname(team.id, user.displayName);
        member.role = TeamRole.ADMIN;
        member.persist();
        return team;
    }

    @Transactional
    public List<Team> listByOrganization(UUID organizationId, User user) {
        accessService.requireOrganization(organizationId);
        boolean orgMember = OrganizationMembership.findByOrgAndUser(organizationId, user.id).isPresent();
        List<TeamMember> memberships = TeamMember.find(
                "user.id = ?1 and team.organization.id = ?2 and deletedAt is null and team.deletedAt is null",
                user.id,
                organizationId
        ).list();
        if (!orgMember && memberships.isEmpty()) {
            throw ApiException.forbidden("Not a member of this organization");
        }
        List<Team> teams = new ArrayList<>();
        for (TeamMember membership : memberships) {
            teams.add(initializeTeamGraph(membership.team));
        }
        return teams;
    }

    @Transactional
    public Team get(UUID teamId, User user) {
        Team team = accessService.requireTeam(teamId);
        accessService.requireTeamMember(teamId, user);
        return initializeTeamGraph(team);
    }

    @Transactional
    public Team updateSettings(UUID teamId, User user, String brandColor, UUID coverMediaId,
                               Boolean revealTributes, Instant revealAt) {
        accessService.requireTeamAdmin(teamId, user);
        Team team = accessService.requireTeam(teamId);
        if (brandColor != null) {
            team.brandColor = brandColor;
        }
        if (coverMediaId != null) {
            MediaAsset cover = MediaAsset.findById(coverMediaId);
            if (cover == null) {
                throw ApiException.notFound("Cover media not found");
            }
            team.coverMedia = cover;
        }
        if (revealTributes != null) {
            team.revealTributes = revealTributes;
        }
        if (revealAt != null) {
            team.revealAt = revealAt;
        }
        return initializeTeamGraph(team);
    }

    @Transactional
    public Team updateYearbookSettings(
            UUID teamId,
            User user,
            String title,
            String subtitle,
            String dedication,
            YearbookTheme theme,
            Boolean showMembers,
            Boolean showTributes,
            Boolean showCharacteristics,
            Boolean showMemories,
            Boolean showAwards
    ) {
        accessService.requireTeamAdmin(teamId, user);
        Team team = accessService.requireTeam(teamId);
        if (title != null) {
            team.yearbookTitle = title.isBlank() ? null : title.trim();
        }
        if (subtitle != null) {
            team.yearbookSubtitle = subtitle.isBlank() ? null : subtitle.trim();
        }
        if (dedication != null) {
            team.yearbookDedication = dedication.isBlank() ? null : dedication.trim();
        }
        if (theme != null) {
            team.yearbookTheme = theme;
        }
        if (showMembers != null) {
            team.yearbookShowMembers = showMembers;
        }
        if (showTributes != null) {
            team.yearbookShowTributes = showTributes;
        }
        if (showCharacteristics != null) {
            team.yearbookShowCharacteristics = showCharacteristics;
        }
        if (showMemories != null) {
            team.yearbookShowMemories = showMemories;
        }
        if (showAwards != null) {
            team.yearbookShowAwards = showAwards;
        }
        return initializeTeamGraph(team);
    }

    @Transactional
    public Invite createInvite(UUID teamId, User user, TeamRole role, Integer maxUses, Instant expiresAt) {
        accessService.requireTeamAdmin(teamId, user);
        Team team = accessService.requireTeam(teamId);
        Invite invite = new Invite();
        invite.team = team;
        invite.code = generateCode();
        invite.role = role == null ? TeamRole.MEMBER : role;
        invite.maxUses = maxUses;
        invite.expiresAt = expiresAt;
        invite.status = InviteStatus.PENDING;
        invite.createdBy = user;
        invite.persist();
        return invite;
    }

    /**
     * Create a single-use invite and email it to the invitee.
     */
    @Transactional
    public Invite inviteByEmail(UUID teamId, User user, String email, TeamRole role) {
        accessService.requireTeamAdmin(teamId, user);
        if (email == null || email.isBlank() || !email.contains("@")) {
            throw ApiException.badRequest("A valid email is required");
        }
        String normalized = email.trim().toLowerCase();
        Team team = accessService.requireTeam(teamId);
        Hibernate.initialize(team.organization);

        User.findByEmail(normalized).ifPresent(existing -> {
            if (TeamMember.findByTeamAndUser(teamId, existing.id).isPresent()) {
                throw ApiException.conflict("That person is already a member of this team");
            }
        });

        Invite invite = new Invite();
        invite.team = team;
        invite.code = generateCode();
        invite.role = role == null ? TeamRole.MEMBER : role;
        invite.maxUses = 1;
        invite.email = normalized;
        invite.status = InviteStatus.PENDING;
        invite.createdBy = user;
        invite.persist();

        try {
            emailService.sendTeamInvite(
                    normalized,
                    user.displayName,
                    team.name,
                    team.organization.name,
                    invite.code
            );
        } catch (RuntimeException e) {
            throw ApiException.badRequest("Could not send invitation email. Try again later.");
        }
        return invite;
    }

    @Transactional
    public List<Invite> listPendingInvites(User user) {
        List<Invite> invites = Invite.listPendingByEmail(user.email);
        List<Invite> pending = new ArrayList<>();
        for (Invite invite : invites) {
            if (TeamMember.findByTeamAndUser(invite.team.id, user.id).isPresent()) {
                continue;
            }
            Hibernate.initialize(invite.team);
            Hibernate.initialize(invite.team.organization);
            pending.add(invite);
        }
        return pending;
    }

    @Transactional
    public TeamMember acceptInvite(User user, UUID inviteId, String nickname, String bio) {
        Invite invite = Invite.findActiveById(inviteId)
                .orElseThrow(() -> ApiException.notFound("Invite not found"));
        requireEmailInviteForUser(invite, user);
        return consumeInvite(user, invite, nickname, bio);
    }

    @Transactional
    public void rejectInvite(User user, UUID inviteId) {
        Invite invite = Invite.findActiveById(inviteId)
                .orElseThrow(() -> ApiException.notFound("Invite not found"));
        requireEmailInviteForUser(invite, user);
        if (invite.status != InviteStatus.PENDING || !invite.isValid()) {
            throw ApiException.badRequest("Invite is no longer pending");
        }
        invite.status = InviteStatus.REJECTED;
    }

    @Transactional
    public TeamMember joinTeam(User user, String code, String nickname, String bio) {
        Invite invite = Invite.findByCode(code.trim())
                .orElseThrow(() -> ApiException.notFound("Invite not found"));
        if (invite.email != null && !invite.email.isBlank()
                && !invite.email.equalsIgnoreCase(user.email)) {
            throw ApiException.forbidden("This invitation was sent to a different email address");
        }
        return consumeInvite(user, invite, nickname, bio);
    }

    private void requireEmailInviteForUser(Invite invite, User user) {
        if (invite.email == null || invite.email.isBlank()) {
            throw ApiException.badRequest("This invite cannot be managed from your inbox");
        }
        if (!invite.email.equalsIgnoreCase(user.email)) {
            throw ApiException.forbidden("This invitation was sent to a different email address");
        }
    }

    private TeamMember consumeInvite(User user, Invite invite, String nickname, String bio) {
        if (!invite.isValid()) {
            throw ApiException.badRequest("Invite is expired, declined, or exhausted");
        }
        if (TeamMember.findByTeamAndUser(invite.team.id, user.id).isPresent()) {
            throw ApiException.conflict("Already a member of this team");
        }
        Hibernate.initialize(invite.team);
        Hibernate.initialize(invite.team.organization);

        String nick = nickname == null || nickname.isBlank() ? user.displayName : nickname.trim();
        if (TeamMember.count("team.id = ?1 and nickname = ?2 and deletedAt is null", invite.team.id, nick) > 0) {
            throw ApiException.conflict("Nickname already taken in this team");
        }
        TeamMember member = new TeamMember();
        member.team = invite.team;
        member.user = user;
        member.nickname = nick;
        member.bio = bio;
        member.role = invite.role;
        member.persist();

        ensureOrgMembership(invite.team.organization, user);

        invite.useCount += 1;
        if (invite.email != null && !invite.email.isBlank()) {
            invite.status = InviteStatus.ACCEPTED;
        } else if (invite.maxUses != null && invite.useCount >= invite.maxUses) {
            invite.status = InviteStatus.ACCEPTED;
        }
        return member;
    }

    private void ensureOrgMembership(Organization org, User user) {
        if (OrganizationMembership.findByOrgAndUser(org.id, user.id).isPresent()) {
            return;
        }
        OrganizationMembership membership = new OrganizationMembership();
        membership.organization = org;
        membership.user = user;
        membership.role = OrgRole.MEMBER;
        membership.persist();
    }

    /**
     * Leave a team. If the user has no remaining teams in the parent organization,
     * their organization membership is removed as well.
     */
    @Transactional
    public void leaveTeam(UUID teamId, User user) {
        TeamMember member = accessService.requireTeamMember(teamId, user);
        Team team = accessService.requireTeam(teamId);
        Hibernate.initialize(team.organization);

        if (member.role == TeamRole.ADMIN) {
            long otherAdmins = TeamMember.count(
                    "team.id = ?1 and role = ?2 and deletedAt is null and id <> ?3",
                    teamId,
                    TeamRole.ADMIN,
                    member.id
            );
            if (otherAdmins == 0) {
                throw ApiException.badRequest(
                        "Cannot leave as the only team admin. Promote another member first."
                );
            }
        }

        member.softDelete();

        UUID orgId = team.organization.id;
        long remainingInOrg = TeamMember.count(
                "user.id = ?1 and team.organization.id = ?2 and deletedAt is null and team.deletedAt is null",
                user.id,
                orgId
        );
        if (remainingInOrg == 0) {
            OrganizationMembership.findByOrgAndUser(orgId, user.id)
                    .ifPresent(OrganizationMembership::delete);
        }
    }

    @Transactional
    public TeamMember updateProfile(UUID teamId, User user, String nickname, String bio, UUID avatarId) {
        TeamMember member = accessService.requireTeamMember(teamId, user);
        if (nickname != null && !nickname.isBlank() && !nickname.equals(member.nickname)) {
            if (TeamMember.count("team.id = ?1 and nickname = ?2 and deletedAt is null and id <> ?3",
                    teamId, nickname.trim(), member.id) > 0) {
                throw ApiException.conflict("Nickname already taken in this team");
            }
            member.nickname = nickname.trim();
        }
        if (bio != null) {
            member.bio = bio;
        }
        if (avatarId != null) {
            MediaAsset avatar = MediaAsset.findById(avatarId);
            if (avatar == null) {
                throw ApiException.notFound("Avatar media not found");
            }
            member.avatar = avatar;
        }
        Hibernate.initialize(member.avatar);
        return member;
    }

    public CursorPage<TeamMember> listMembers(UUID teamId, User user, Integer first, String after, String query) {
        accessService.requireTeamMember(teamId, user);
        int limit = first == null || first < 1 || first > 50 ? 20 : first;
        CursorUtil.Cursor cursor = CursorUtil.decode(after);

        StringBuilder ql = new StringBuilder("team.id = ?1 and deletedAt is null");
        var params = new java.util.ArrayList<>();
        params.add(teamId);
        int idx = 2;
        if (query != null && !query.isBlank()) {
            ql.append(" and lower(nickname) like ?").append(idx++);
            params.add("%" + query.trim().toLowerCase() + "%");
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

        List<TeamMember> rows = TeamMember.find(ql.toString(), params.toArray())
                .page(0, limit + 1)
                .list();
        boolean hasNext = rows.size() > limit;
        List<TeamMember> page = hasNext ? rows.subList(0, limit) : rows;
        String next = null;
        if (hasNext && !page.isEmpty()) {
            TeamMember last = page.get(page.size() - 1);
            next = CursorUtil.encode(last.createdAt, last.id);
        }
        return new CursorPage<>(page, next, hasNext);
    }

    public TeamMember getMember(UUID memberId, User user) {
        TeamMember member = TeamMember.findActiveById(memberId)
                .orElseThrow(() -> ApiException.notFound("Team member not found"));
        accessService.requireTeamMember(member.team.id, user);
        return member;
    }

    @Transactional
    public TeamMember myMembership(UUID teamId, User user) {
        TeamMember member = accessService.requireTeamMember(teamId, user);
        Hibernate.initialize(member.avatar);
        return member;
    }

    private Team initializeTeamGraph(Team team) {
        // TeamType.from reads coverMedia.url after the persistence context may be closed.
        Hibernate.initialize(team.coverMedia);
        Hibernate.initialize(team.organization);
        return team;
    }

    private String uniqueNickname(UUID teamId, String base) {
        String candidate = base == null || base.isBlank() ? "member" : base.trim();
        String nick = candidate;
        int i = 1;
        while (TeamMember.count("team.id = ?1 and nickname = ?2 and deletedAt is null", teamId, nick) > 0) {
            nick = candidate + i++;
        }
        return nick;
    }

    private String generateCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
