package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.OrganizationType;
import com.yaadbuzz.rest.dto.ApiDtos.TeamType;
import com.yaadbuzz.rest.dto.ApiRequests.CreateOrganizationRequest;
import com.yaadbuzz.rest.dto.ApiRequests.CreateTeamRequest;
import com.yaadbuzz.rest.dto.ApiRequests.UpdateOrganizationBrandingRequest;
import com.yaadbuzz.service.OrganizationService;
import com.yaadbuzz.service.TeamService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/organizations")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Organizations")
@RolesAllowed("user")
public class OrganizationResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    OrganizationService organizationService;
    @Inject
    TeamService teamService;

    @GET
    @Operation(summary = "List organizations for the current user")
    public List<OrganizationType> listMine() {
        return organizationService.listMine(currentUserService.requireUser()).stream()
                .map(OrganizationType::from)
                .toList();
    }

    @POST
    @Operation(summary = "Create an organization")
    public OrganizationType create(CreateOrganizationRequest request) {
        return OrganizationType.from(organizationService.create(
                currentUserService.requireUser(), request.name(), request.brandColor()));
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get an organization")
    public OrganizationType get(@PathParam("id") UUID id) {
        return OrganizationType.from(organizationService.get(id, currentUserService.requireUser()));
    }

    @PATCH
    @Path("/{id}/branding")
    @Operation(summary = "Update organization branding")
    public OrganizationType updateBranding(@PathParam("id") UUID id, UpdateOrganizationBrandingRequest request) {
        return OrganizationType.from(organizationService.updateBranding(
                id, currentUserService.requireUser(), request.brandColor(), request.logoId()));
    }

    @GET
    @Path("/{orgId}/teams")
    @Operation(summary = "List teams in an organization")
    public List<TeamType> listTeams(@PathParam("orgId") UUID orgId) {
        return teamService.listByOrganization(orgId, currentUserService.requireUser()).stream()
                .map(TeamType::from)
                .toList();
    }

    @POST
    @Path("/{orgId}/teams")
    @Operation(summary = "Create a team in an organization")
    public TeamType createTeam(@PathParam("orgId") UUID orgId, CreateTeamRequest request) {
        return TeamType.from(teamService.create(
                currentUserService.requireUser(), orgId, request.name(), request.brandColor()));
    }
}
