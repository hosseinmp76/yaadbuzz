package com.yaadbuzz.rest;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.UserType;
import com.yaadbuzz.rest.dto.ApiRequests.UpdateProfileRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/me")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Me")
@RolesAllowed("user")
public class MeResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    AuthService authService;

    @GET
    @Operation(summary = "Current authenticated user")
    public UserType me() {
        return UserType.from(currentUserService.requireUser());
    }

    @PATCH
    @Operation(summary = "Update the current user's display name")
    public UserType updateProfile(UpdateProfileRequest request) {
        return UserType.from(authService.updateDisplayName(currentUserService.requireUser(), request.displayName()));
    }
}
