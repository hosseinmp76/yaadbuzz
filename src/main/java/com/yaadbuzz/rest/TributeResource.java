package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.TributeType;
import com.yaadbuzz.rest.dto.ApiRequests.ReportTributeRequest;
import com.yaadbuzz.service.TributeService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/tributes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Tributes")
@RolesAllowed("user")
public class TributeResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    TributeService tributeService;

    @POST
    @Path("/{id}/report")
    @Operation(summary = "Report a tribute")
    public Map<String, Boolean> report(@PathParam("id") UUID id, ReportTributeRequest request) {
        tributeService.report(id, currentUserService.requireUser(), request.reason());
        return Map.of("ok", true);
    }

    @POST
    @Path("/{id}/hide")
    @Operation(summary = "Hide a tribute")
    public TributeType hide(@PathParam("id") UUID id) {
        return TributeType.from(tributeService.hide(id, currentUserService.requireUser()));
    }
}
