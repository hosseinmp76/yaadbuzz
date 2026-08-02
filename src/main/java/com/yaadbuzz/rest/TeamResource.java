package com.yaadbuzz.rest;

import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.rest.dto.ApiDtos.ConnectionMemory;
import com.yaadbuzz.rest.dto.ApiDtos.ConnectionSearch;
import com.yaadbuzz.rest.dto.ApiDtos.ConnectionTeamMember;
import com.yaadbuzz.rest.dto.ApiDtos.ConnectionTribute;
import com.yaadbuzz.rest.dto.ApiDtos.InviteType;
import com.yaadbuzz.rest.dto.ApiDtos.MemoryType;
import com.yaadbuzz.rest.dto.ApiDtos.SearchHitType;
import com.yaadbuzz.rest.dto.ApiDtos.TeamMemberType;
import com.yaadbuzz.rest.dto.ApiDtos.TeamType;
import com.yaadbuzz.rest.dto.ApiDtos.TopicType;
import com.yaadbuzz.rest.dto.ApiDtos.TributeType;
import com.yaadbuzz.rest.dto.ApiDtos.YearbookExportType;
import com.yaadbuzz.rest.dto.ApiDtos.YearbookType;
import com.yaadbuzz.rest.dto.ApiRequests.CreateInviteRequest;
import com.yaadbuzz.rest.dto.ApiRequests.CreateMemoryRequest;
import com.yaadbuzz.rest.dto.ApiRequests.CreateTopicRequest;
import com.yaadbuzz.rest.dto.ApiRequests.CreateTributeRequest;
import com.yaadbuzz.rest.dto.ApiRequests.InviteByEmailRequest;
import com.yaadbuzz.rest.dto.ApiRequests.JoinTeamRequest;
import com.yaadbuzz.rest.dto.ApiRequests.UpdateTeamSettingsRequest;
import com.yaadbuzz.rest.dto.ApiRequests.UpdateYearbookSettingsRequest;
import com.yaadbuzz.rest.dto.ApiRequests.UpsertTeamMemberProfileRequest;
import com.yaadbuzz.pdf.YearbookContentService;
import com.yaadbuzz.pdf.YearbookPdfService;
import com.yaadbuzz.search.SearchService;
import com.yaadbuzz.service.MemoryService;
import com.yaadbuzz.service.TeamService;
import com.yaadbuzz.service.TopicService;
import com.yaadbuzz.service.TributeService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/teams")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Teams")
@RolesAllowed("user")
public class TeamResource {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    TeamService teamService;
    @Inject
    TributeService tributeService;
    @Inject
    MemoryService memoryService;
    @Inject
    TopicService topicService;
    @Inject
    SearchService searchService;
    @Inject
    YearbookPdfService yearbookPdfService;
    @Inject
    YearbookContentService yearbookContentService;

    @POST
    @Path("/join")
    @Operation(summary = "Join a team with an invite code")
    public TeamMemberType join(JoinTeamRequest request) {
        return TeamMemberType.from(teamService.joinTeam(
                currentUserService.requireUser(), request.code(), request.nickname(), request.bio()));
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a team")
    public TeamType get(@PathParam("id") UUID id) {
        return TeamType.from(teamService.get(id, currentUserService.requireUser()));
    }

    @PATCH
    @Path("/{id}")
    @Operation(summary = "Update team settings")
    public TeamType updateSettings(@PathParam("id") UUID id, UpdateTeamSettingsRequest request) {
        return TeamType.from(teamService.updateSettings(
                id,
                currentUserService.requireUser(),
                request.brandColor(),
                request.coverMediaId(),
                request.revealTributes(),
                request.revealAt()));
    }

    @PATCH
    @Path("/{id}/yearbook-settings")
    @Operation(summary = "Update yearbook layout settings")
    public TeamType updateYearbookSettings(@PathParam("id") UUID id, UpdateYearbookSettingsRequest request) {
        return TeamType.from(teamService.updateYearbookSettings(
                id,
                currentUserService.requireUser(),
                request.title(),
                request.subtitle(),
                request.dedication(),
                request.theme(),
                request.showMembers(),
                request.showTributes(),
                request.showCharacteristics(),
                request.showMemories(),
                request.showAwards()));
    }

    @GET
    @Path("/{id}/members")
    @Operation(summary = "List team members")
    public ConnectionTeamMember members(
            @PathParam("id") UUID id,
            @QueryParam("first") Integer first,
            @QueryParam("after") String after,
            @QueryParam("query") String query
    ) {
        var page = teamService.listMembers(id, currentUserService.requireUser(), first, after, query);
        return new ConnectionTeamMember(
                page.items().stream().map(TeamMemberType::from).toList(),
                page.nextCursor(),
                page.hasNext());
    }

    @GET
    @Path("/{id}/members/me")
    @Operation(summary = "Current user's membership in a team")
    public TeamMemberType myMembership(@PathParam("id") UUID id) {
        return TeamMemberType.from(teamService.myMembership(id, currentUserService.requireUser()));
    }

    @PATCH
    @Path("/{id}/profile")
    @Operation(summary = "Upsert current user's team profile")
    public TeamMemberType upsertProfile(@PathParam("id") UUID id, UpsertTeamMemberProfileRequest request) {
        return TeamMemberType.from(teamService.updateProfile(
                id, currentUserService.requireUser(), request.nickname(), request.bio(), request.avatarId()));
    }

    @POST
    @Path("/{id}/invites")
    @Operation(summary = "Create an invite code")
    public InviteType createInvite(@PathParam("id") UUID id, CreateInviteRequest request) {
        return InviteType.from(teamService.createInvite(
                id, currentUserService.requireUser(), request.role(), request.maxUses(), request.expiresAt()));
    }

    @POST
    @Path("/{id}/invites/email")
    @Operation(summary = "Invite a member by email")
    public InviteType inviteByEmail(@PathParam("id") UUID id, InviteByEmailRequest request) {
        return InviteType.from(teamService.inviteByEmail(
                id, currentUserService.requireUser(), request.email(), request.role()));
    }

    @GET
    @Path("/{id}/tributes")
    @Operation(summary = "List tributes")
    public ConnectionTribute tributes(
            @PathParam("id") UUID id,
            @QueryParam("recipientId") UUID recipientId,
            @QueryParam("first") Integer first,
            @QueryParam("after") String after
    ) {
        var page = tributeService.list(id, currentUserService.requireUser(), recipientId, first, after);
        return new ConnectionTribute(
                page.items().stream().map(TributeType::from).toList(),
                page.nextCursor(),
                page.hasNext());
    }

    @POST
    @Path("/{id}/tributes")
    @Operation(summary = "Create a tribute")
    public TributeType createTribute(@PathParam("id") UUID id, CreateTributeRequest request) {
        return TributeType.from(tributeService.create(
                id,
                currentUserService.requireUser(),
                request.recipientId(),
                request.text(),
                request.anonymous(),
                request.privateTribute()));
    }

    @GET
    @Path("/{id}/memories")
    @Operation(summary = "List memories")
    public ConnectionMemory memories(
            @PathParam("id") UUID id,
            @QueryParam("first") Integer first,
            @QueryParam("after") String after
    ) {
        var page = memoryService.list(id, currentUserService.requireUser(), first, after);
        return new ConnectionMemory(
                page.items().stream().map(MemoryType::from).toList(),
                page.nextCursor(),
                page.hasNext());
    }

    @POST
    @Path("/{id}/memories")
    @Operation(summary = "Create a memory")
    public MemoryType createMemory(@PathParam("id") UUID id, CreateMemoryRequest request) {
        return MemoryType.from(memoryService.create(
                id,
                currentUserService.requireUser(),
                request.title(),
                request.bodyText(),
                request.privateMemory(),
                request.taggedIds(),
                request.mediaIds()));
    }

    @GET
    @Path("/{id}/topics")
    @Operation(summary = "List topics")
    public List<TopicType> topics(@PathParam("id") UUID id) {
        return topicService.list(id, currentUserService.requireUser()).stream().map(TopicType::from).toList();
    }

    @POST
    @Path("/{id}/topics")
    @Operation(summary = "Create a topic")
    public TopicType createTopic(@PathParam("id") UUID id, CreateTopicRequest request) {
        return TopicType.from(topicService.create(id, currentUserService.requireUser(), request.title()));
    }

    @GET
    @Path("/{id}/search")
    @Operation(summary = "Search within a team")
    public ConnectionSearch search(
            @PathParam("id") UUID id,
            @QueryParam("q") String q,
            @QueryParam("first") Integer first,
            @QueryParam("after") String after
    ) {
        var page = searchService.search(id, currentUserService.requireUser(), q, first, after);
        return new ConnectionSearch(
                page.items().stream().map(SearchHitType::from).toList(),
                page.nextCursor(),
                page.hasNext());
    }

    @GET
    @Path("/{id}/yearbook")
    @Operation(summary = "Assembled yearbook for online viewing")
    public YearbookType yearbook(@PathParam("id") UUID id) {
        return YearbookType.from(yearbookContentService.loadForTeam(id, currentUserService.requireUser()));
    }

    @GET
    @Path("/{id}/yearbook-exports")
    @Operation(summary = "List yearbook PDF exports")
    public List<YearbookExportType> yearbookExports(@PathParam("id") UUID id) {
        return yearbookPdfService.listExports(id, currentUserService.requireUser()).stream()
                .map(YearbookExportType::from)
                .toList();
    }

    @POST
    @Path("/{id}/yearbook-exports")
    @Operation(summary = "Request a yearbook PDF export")
    public YearbookExportType requestYearbookExport(@PathParam("id") UUID id) {
        return YearbookExportType.from(yearbookPdfService.requestExport(id, currentUserService.requireUser()));
    }
}
