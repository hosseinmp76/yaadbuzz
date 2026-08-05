package com.yaadbuzz.rest;

import com.yaadbuzz.service.AppConfigService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/features")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Features")
@RolesAllowed("user")
public class FeaturesResource {

    @Inject
    AppConfigService appConfigService;

    @GET
    @Operation(summary = "Feature flags for the current deployment")
    public FeaturesResponse features() {
        return new FeaturesResponse(appConfigService.isTeamEncryptionOffered());
    }

    public record FeaturesResponse(boolean teamEncryption) {
    }
}
