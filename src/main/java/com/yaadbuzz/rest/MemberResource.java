package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.CharacteristicType;
import com.yaadbuzz.rest.dto.ApiDtos.TeamMemberType;
import com.yaadbuzz.rest.dto.ApiRequests.AddCharacteristicRequest;
import com.yaadbuzz.service.CharacteristicService;
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

@Path("/api/members")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Members")
@RolesAllowed("user")
public class MemberResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    TeamService teamService;
    @Inject
    CharacteristicService characteristicService;

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a team member")
    public TeamMemberType get(@PathParam("id") UUID id) {
        return TeamMemberType.from(teamService.getMember(id, currentUserService.requireUser()));
    }

    @GET
    @Path("/{id}/characteristics")
    @Operation(summary = "List characteristics for a member")
    public List<CharacteristicType> characteristics(@PathParam("id") UUID id) {
        return characteristicService.listForMember(id, currentUserService.requireUser()).stream()
                .map(CharacteristicType::from)
                .toList();
    }

    @POST
    @Path("/{id}/characteristics")
    @Operation(summary = "Add a characteristic")
    public CharacteristicType addCharacteristic(@PathParam("id") UUID id, AddCharacteristicRequest request) {
        return CharacteristicType.from(
                characteristicService.add(id, currentUserService.requireUser(), request.title()));
    }
}
