package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.TopicStandingType;
import com.yaadbuzz.rest.dto.ApiRequests.VoteTopicRequest;
import com.yaadbuzz.service.TopicService;
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
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/topics")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Topics")
@RolesAllowed("user")
public class TopicResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    TopicService topicService;

    @GET
    @Path("/{id}/standings")
    @Operation(summary = "Topic vote standings")
    public List<TopicStandingType> standings(@PathParam("id") UUID id) {
        return topicService.standings(id, currentUserService.requireUser()).stream()
                .map(TopicStandingType::from)
                .toList();
    }

    @POST
    @Path("/{id}/votes")
    @Operation(summary = "Vote on a topic")
    public Map<String, Boolean> vote(@PathParam("id") UUID id, VoteTopicRequest request) {
        topicService.vote(
                id, currentUserService.requireUser(), request.nomineeId(), request.repetitions());
        return Map.of("ok", true);
    }
}
