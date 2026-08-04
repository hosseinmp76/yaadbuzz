package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.OrganizationMembership;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.OrgRole;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.hibernate.Hibernate;

@ApplicationScoped
public class OrganizationService {

    @Inject
    AccessService accessService;

    @Transactional
    public Organization create(User user, String name, String brandColor) {
        if (name == null || name.isBlank()) {
            throw ApiException.badRequest("Organization name is required");
        }
        Organization org = new Organization();
        org.name = name.trim();
        org.brandColor = brandColor;
        org.owner = user;
        org.persist();

        OrganizationMembership membership = new OrganizationMembership();
        membership.organization = org;
        membership.user = user;
        membership.role = OrgRole.OWNER;
        membership.persist();
        return org;
    }

    public List<Organization> listMine(User user) {
        Map<UUID, Organization> byId = new LinkedHashMap<>();
        for (OrganizationMembership membership : OrganizationMembership.listByUser(user.id)) {
            Organization org = membership.organization;
            if (org != null && !org.isDeleted()) {
                byId.put(org.id, org);
            }
        }
        List<TeamMember> teamMemberships = TeamMember.find(
                "user.id = ?1 and deletedAt is null and team.deletedAt is null",
                user.id
        ).list();
        for (TeamMember membership : teamMemberships) {
            Hibernate.initialize(membership.team);
            Hibernate.initialize(membership.team.organization);
            Organization org = membership.team.organization;
            if (org != null && !org.isDeleted()) {
                byId.putIfAbsent(org.id, org);
            }
        }
        return List.copyOf(byId.values());
    }

    public Organization get(UUID id, User user) {
        Organization org = accessService.requireOrganization(id);
        boolean orgMember = OrganizationMembership.findByOrgAndUser(id, user.id).isPresent();
        boolean teamMember = TeamMember.count(
                "user.id = ?1 and team.organization.id = ?2 and deletedAt is null",
                user.id,
                id
        ) > 0;
        if (!orgMember && !teamMember) {
            throw ApiException.forbidden("Not a member of this organization");
        }
        return org;
    }

    @Transactional
    public Organization updateBranding(UUID id, User user, String brandColor, UUID logoId) {
        accessService.requireOrgAdmin(id, user);
        Organization org = accessService.requireOrganization(id);
        if (brandColor != null) {
            org.brandColor = brandColor;
        }
        if (logoId != null) {
            MediaAsset logo = MediaAsset.findById(logoId);
            if (logo == null) {
                throw ApiException.notFound("Logo media not found");
            }
            org.logo = logo;
        }
        return org;
    }
}
