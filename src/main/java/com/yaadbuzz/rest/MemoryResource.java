package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.CommentType;
import com.yaadbuzz.rest.dto.ApiRequests.AddCommentRequest;
import com.yaadbuzz.service.MemoryService;
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

@Path("/api/memories")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Memories")
@RolesAllowed("user")
public class MemoryResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    MemoryService memoryService;

    @GET
    @Path("/{id}/comments")
    @Operation(summary = "List comments on a memory")
    public List<CommentType> comments(@PathParam("id") UUID id) {
        return memoryService.listComments(id, currentUserService.requireUser()).stream()
                .map(CommentType::from)
                .toList();
    }

    @POST
    @Path("/{id}/comments")
    @Operation(summary = "Add a comment to a memory")
    public CommentType addComment(@PathParam("id") UUID id, AddCommentRequest request) {
        return CommentType.from(memoryService.addComment(
                id,
                currentUserService.requireUser(),
                request.text(),
                request.parentId(),
                request.mediaIds()));
    }
}
