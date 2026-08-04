package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.PendingInviteType;
import com.yaadbuzz.rest.dto.ApiDtos.TeamMemberType;
import com.yaadbuzz.rest.dto.ApiRequests.AcceptInviteRequest;
import com.yaadbuzz.rest.dto.AuthDtos.MessageResponse;
import com.yaadbuzz.service.TeamService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/invites")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Invites")
@RolesAllowed("user")
public class InviteResource {

    @Inject
    CurrentUserService currentUserService;

    @Inject
    TeamService teamService;

    @GET
    @Path("/pending")
    @Operation(summary = "List pending email invitations for the current user")
    public List<PendingInviteType> pending() {
        return teamService.listPendingInvites(currentUserService.requireUser()).stream()
                .map(PendingInviteType::from)
                .toList();
    }

    @POST
    @Path("/{id}/accept")
    @Operation(summary = "Accept a pending email invitation")
    public TeamMemberType accept(@PathParam("id") UUID id, AcceptInviteRequest request) {
        String nickname = request == null ? null : request.nickname();
        String bio = request == null ? null : request.bio();
        return TeamMemberType.from(teamService.acceptInvite(
                currentUserService.requireUser(), id, nickname, bio));
    }

    @POST
    @Path("/{id}/reject")
    @Operation(summary = "Reject a pending email invitation")
    public MessageResponse reject(@PathParam("id") UUID id) {
        teamService.rejectInvite(currentUserService.requireUser(), id);
        return new MessageResponse("Invitation declined.");
    }
}
