package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.storage.ObjectStorageService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Path("/api/media")
@Tag(name = "Media")
@RolesAllowed("user")
public class MediaResource {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    @Inject
    CurrentUserService currentUserService;

    @Inject
    ObjectStorageService storageService;

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Upload an image to object storage")
    @Transactional
    public Map<String, Object> upload(@RestForm("file") FileUpload file) throws IOException {
        User user = currentUserService.requireUser();
        if (file == null) {
            throw ApiException.badRequest("file is required");
        }
        String contentType = file.contentType() == null ? "application/octet-stream" : file.contentType();
        if (!ALLOWED.contains(contentType)) {
            throw ApiException.badRequest("Only image uploads are allowed");
        }
        byte[] bytes = java.nio.file.Files.readAllBytes(file.uploadedFile());
        if (bytes.length > 5 * 1024 * 1024) {
            throw ApiException.badRequest("File too large (max 5MB)");
        }
        var stored = storageService.upload(bytes, contentType, "media");
        MediaAsset asset = new MediaAsset();
        asset.storageKey = stored.storageKey();
        asset.url = stored.url();
        asset.mimeType = contentType;
        asset.sizeBytes = bytes.length;
        asset.uploadedBy = user;
        asset.persist();
        return Map.of(
                "id", asset.id,
                "url", asset.url,
                "mimeType", asset.mimeType
        );
    }
}
