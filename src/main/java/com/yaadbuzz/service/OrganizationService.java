package com.yaadbuzz.service;

import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.OrganizationMembership;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.OrgRole;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

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
        return OrganizationMembership.listByUser(user.id).stream()
                .map(m -> m.organization)
                .filter(o -> !o.isDeleted())
                .toList();
    }

    public Organization get(UUID id, User user) {
        Organization org = accessService.requireOrganization(id);
        accessService.requireOrgMember(id, user);
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
