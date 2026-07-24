package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.pdf.YearbookPdfService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/yearbooks")
@Tag(name = "Yearbooks")
@RolesAllowed("user")
public class YearbookResource {

    @Inject
    CurrentUserService currentUserService;

    @Inject
    YearbookPdfService yearbookPdfService;

    @GET
    @Path("/{id}/download")
    @Produces("application/pdf")
    @Operation(summary = "Download a generated yearbook PDF")
    public Response download(@PathParam("id") UUID id) {
        byte[] pdf = yearbookPdfService.loadPdf(id, currentUserService.requireUser());
        return Response.ok(pdf)
                .header("Content-Disposition", "attachment; filename=\"yearbook-" + id + ".pdf\"")
                .build();
    }
}
