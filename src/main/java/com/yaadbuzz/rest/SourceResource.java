package com.yaadbuzz.rest;

import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.Map;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/source")
@Tag(name = "AGPL")
@PermitAll
public class SourceResource {

    @ConfigProperty(name = "yaadbuzz.source-url", defaultValue = "https://github.com/hosseinmp76/yaadbuzz")
    String sourceUrl;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "AGPL corresponding source offer")
    public Map<String, String> sourceInfo() {
        return Map.of(
                "license", "AGPL-3.0-only",
                "sourceUrl", sourceUrl,
                "notice", "Corresponding Source for this network service is available at the sourceUrl."
        );
    }

    @GET
    @Path("/redirect")
    @Operation(summary = "Redirect to corresponding source repository")
    public Response redirect() {
        return Response.seeOther(URI.create(sourceUrl)).build();
    }
}
