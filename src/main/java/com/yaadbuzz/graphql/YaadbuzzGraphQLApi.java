package com.yaadbuzz.graphql;

import com.yaadbuzz.auth.AuthService;
import com.yaadbuzz.auth.CurrentUserService;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.enums.TeamRole;
import com.yaadbuzz.enums.YearbookTheme;
import com.yaadbuzz.graphql.types.GqlTypes;
import com.yaadbuzz.graphql.types.GqlTypes.CharacteristicType;
import com.yaadbuzz.graphql.types.GqlTypes.CommentType;
import com.yaadbuzz.graphql.types.GqlTypes.ConnectionMemory;
import com.yaadbuzz.graphql.types.GqlTypes.ConnectionSearch;
import com.yaadbuzz.graphql.types.GqlTypes.ConnectionTeamMember;
import com.yaadbuzz.graphql.types.GqlTypes.ConnectionTribute;
import com.yaadbuzz.graphql.types.GqlTypes.InviteType;
import com.yaadbuzz.graphql.types.GqlTypes.MemoryType;
import com.yaadbuzz.graphql.types.GqlTypes.OrganizationType;
import com.yaadbuzz.graphql.types.GqlTypes.TeamMemberType;
import com.yaadbuzz.graphql.types.GqlTypes.TeamType;
import com.yaadbuzz.graphql.types.GqlTypes.TopicStandingType;
import com.yaadbuzz.graphql.types.GqlTypes.TopicType;
import com.yaadbuzz.graphql.types.GqlTypes.TributeType;
import com.yaadbuzz.graphql.types.GqlTypes.UserType;
import com.yaadbuzz.graphql.types.GqlTypes.YearbookExportType;
import com.yaadbuzz.graphql.types.GqlTypes.YearbookType;
import com.yaadbuzz.pdf.YearbookContentService;
import com.yaadbuzz.pdf.YearbookPdfService;
import com.yaadbuzz.search.SearchService;
import com.yaadbuzz.service.CharacteristicService;
import com.yaadbuzz.service.MemoryService;
import com.yaadbuzz.service.OrganizationService;
import com.yaadbuzz.service.TeamService;
import com.yaadbuzz.service.TopicService;
import com.yaadbuzz.service.TributeService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Name;
import org.eclipse.microprofile.graphql.Query;

@GraphQLApi
@RolesAllowed("user")
public class YaadbuzzGraphQLApi {

    @Inject
    CurrentUserService currentUserService;
    @Inject
    AuthService authService;
    @Inject
    OrganizationService organizationService;
    @Inject
    TeamService teamService;
    @Inject
    TributeService tributeService;
    @Inject
    MemoryService memoryService;
    @Inject
    TopicService topicService;
    @Inject
    CharacteristicService characteristicService;
    @Inject
    SearchService searchService;
    @Inject
    YearbookPdfService yearbookPdfService;
    @Inject
    YearbookContentService yearbookContentService;

    @Query
    @Description("Current authenticated user")
    public UserType me() {
        return UserType.from(currentUserService.requireUser());
    }

    @Mutation
    @Description("Update the current user's display name")
    public UserType updateMyProfile(@Name("displayName") String displayName) {
        return UserType.from(authService.updateDisplayName(currentUserService.requireUser(), displayName));
    }

    @Query
    public List<OrganizationType> myOrganizations() {
        User user = currentUserService.requireUser();
        return organizationService.listMine(user).stream().map(OrganizationType::from).toList();
    }

    @Query
    public OrganizationType organization(@Name("id") UUID id) {
        return OrganizationType.from(organizationService.get(id, currentUserService.requireUser()));
    }

    @Query
    public List<TeamType> teams(@Name("organizationId") UUID organizationId) {
        return teamService.listByOrganization(organizationId, currentUserService.requireUser())
                .stream().map(TeamType::from).toList();
    }

    @Query
    public TeamType team(@Name("id") UUID id) {
        return TeamType.from(teamService.get(id, currentUserService.requireUser()));
    }

    @Query
    public ConnectionTeamMember teamMembers(
            @Name("teamId") UUID teamId,
            @Name("first") Integer first,
            @Name("after") String after,
            @Name("query") String query
    ) {
        var page = teamService.listMembers(teamId, currentUserService.requireUser(), first, after, query);
        return new ConnectionTeamMember(
                page.items().stream().map(TeamMemberType::from).toList(),
                page.nextCursor(),
                page.hasNext()
        );
    }

    @Query
    public TeamMemberType teamMember(@Name("id") UUID id) {
        return TeamMemberType.from(teamService.getMember(id, currentUserService.requireUser()));
    }

    @Query
    @Description("Current user's membership in a team")
    public TeamMemberType myTeamMembership(@Name("teamId") UUID teamId) {
        return TeamMemberType.from(teamService.myMembership(teamId, currentUserService.requireUser()));
    }

    @Query
    public ConnectionTribute tributes(
            @Name("teamId") UUID teamId,
            @Name("recipientId") UUID recipientId,
            @Name("first") Integer first,
            @Name("after") String after
    ) {
        var page = tributeService.list(teamId, currentUserService.requireUser(), recipientId, first, after);
        return new ConnectionTribute(
                page.items().stream().map(TributeType::from).toList(),
                page.nextCursor(),
                page.hasNext()
        );
    }

    @Query
    public ConnectionMemory memories(
            @Name("teamId") UUID teamId,
            @Name("first") Integer first,
            @Name("after") String after
    ) {
        var page = memoryService.list(teamId, currentUserService.requireUser(), first, after);
        return new ConnectionMemory(
                page.items().stream().map(MemoryType::from).toList(),
                page.nextCursor(),
                page.hasNext()
        );
    }

    @Query
    public List<CommentType> comments(@Name("memoryId") UUID memoryId) {
        return memoryService.listComments(memoryId, currentUserService.requireUser())
                .stream().map(CommentType::from).toList();
    }

    @Query
    public List<TopicType> topics(@Name("teamId") UUID teamId) {
        return topicService.list(teamId, currentUserService.requireUser()).stream().map(TopicType::from).toList();
    }

    @Query
    public List<TopicStandingType> topicStandings(@Name("topicId") UUID topicId) {
        return topicService.standings(topicId, currentUserService.requireUser())
                .stream().map(TopicStandingType::from).toList();
    }

    @Query
    public List<CharacteristicType> characteristics(@Name("teamMemberId") UUID teamMemberId) {
        return characteristicService.listForMember(teamMemberId, currentUserService.requireUser())
                .stream().map(CharacteristicType::from).toList();
    }

    @Query
    public ConnectionSearch search(
            @Name("teamId") UUID teamId,
            @Name("q") String q,
            @Name("first") Integer first,
            @Name("after") String after
    ) {
        var page = searchService.search(teamId, currentUserService.requireUser(), q, first, after);
        return new ConnectionSearch(
                page.items().stream().map(GqlTypes.SearchHitType::from).toList(),
                page.nextCursor(),
                page.hasNext()
        );
    }

    @Query
    public List<YearbookExportType> yearbookExports(@Name("teamId") UUID teamId) {
        return yearbookPdfService.listExports(teamId, currentUserService.requireUser())
                .stream().map(YearbookExportType::from).toList();
    }

    @Query
    @Description("Assembled yearbook for online viewing and browser print-to-PDF")
    public YearbookType yearbook(@Name("teamId") UUID teamId) {
        return YearbookType.from(yearbookContentService.loadForTeam(teamId, currentUserService.requireUser()));
    }

    @Mutation
    public OrganizationType createOrganization(@Name("name") String name, @Name("brandColor") String brandColor) {
        return OrganizationType.from(organizationService.create(currentUserService.requireUser(), name, brandColor));
    }

    @Mutation
    public OrganizationType updateOrganizationBranding(
            @Name("id") UUID id,
            @Name("brandColor") String brandColor,
            @Name("logoId") UUID logoId
    ) {
        return OrganizationType.from(organizationService.updateBranding(id, currentUserService.requireUser(), brandColor, logoId));
    }

    @Mutation
    public TeamType createTeam(
            @Name("organizationId") UUID organizationId,
            @Name("name") String name,
            @Name("brandColor") String brandColor
    ) {
        return TeamType.from(teamService.create(currentUserService.requireUser(), organizationId, name, brandColor));
    }

    @Mutation
    public TeamType updateTeamSettings(
            @Name("teamId") UUID teamId,
            @Name("brandColor") String brandColor,
            @Name("coverMediaId") UUID coverMediaId,
            @Name("revealTributes") Boolean revealTributes,
            @Name("revealAt") Instant revealAt
    ) {
        return TeamType.from(teamService.updateSettings(
                teamId, currentUserService.requireUser(), brandColor, coverMediaId, revealTributes, revealAt));
    }

    @Mutation
    @Description("Customize online/print yearbook layout and sections")
    public TeamType updateYearbookSettings(
            @Name("teamId") UUID teamId,
            @Name("title") String title,
            @Name("subtitle") String subtitle,
            @Name("dedication") String dedication,
            @Name("theme") YearbookTheme theme,
            @Name("showMembers") Boolean showMembers,
            @Name("showTributes") Boolean showTributes,
            @Name("showCharacteristics") Boolean showCharacteristics,
            @Name("showMemories") Boolean showMemories,
            @Name("showAwards") Boolean showAwards
    ) {
        return TeamType.from(teamService.updateYearbookSettings(
                teamId,
                currentUserService.requireUser(),
                title,
                subtitle,
                dedication,
                theme,
                showMembers,
                showTributes,
                showCharacteristics,
                showMemories,
                showAwards));
    }

    @Mutation
    public InviteType createInvite(
            @Name("teamId") UUID teamId,
            @Name("role") TeamRole role,
            @Name("maxUses") Integer maxUses,
            @Name("expiresAt") Instant expiresAt
    ) {
        return InviteType.from(teamService.createInvite(teamId, currentUserService.requireUser(), role, maxUses, expiresAt));
    }

    @Mutation
    public TeamMemberType joinTeam(
            @Name("code") String code,
            @Name("nickname") String nickname,
            @Name("bio") String bio
    ) {
        return TeamMemberType.from(teamService.joinTeam(currentUserService.requireUser(), code, nickname, bio));
    }

    @Mutation
    public TeamMemberType upsertTeamMemberProfile(
            @Name("teamId") UUID teamId,
            @Name("nickname") String nickname,
            @Name("bio") String bio,
            @Name("avatarId") UUID avatarId
    ) {
        return TeamMemberType.from(teamService.updateProfile(
                teamId, currentUserService.requireUser(), nickname, bio, avatarId));
    }

    @Mutation
    public TributeType createTribute(
            @Name("teamId") UUID teamId,
            @Name("recipientId") UUID recipientId,
            @Name("text") String text,
            @Name("anonymous") boolean anonymous,
            @Name("privateTribute") boolean privateTribute
    ) {
        return TributeType.from(tributeService.create(
                teamId, currentUserService.requireUser(), recipientId, text, anonymous, privateTribute));
    }

    @Mutation
    public Boolean reportTribute(@Name("tributeId") UUID tributeId, @Name("reason") String reason) {
        tributeService.report(tributeId, currentUserService.requireUser(), reason);
        return true;
    }

    @Mutation
    public TributeType hideTribute(@Name("tributeId") UUID tributeId) {
        return TributeType.from(tributeService.hide(tributeId, currentUserService.requireUser()));
    }

    @Mutation
    public MemoryType createMemory(
            @Name("teamId") UUID teamId,
            @Name("title") String title,
            @Name("bodyText") String bodyText,
            @Name("privateMemory") boolean privateMemory,
            @Name("taggedIds") List<UUID> taggedIds
    ) {
        return MemoryType.from(memoryService.create(
                teamId, currentUserService.requireUser(), title, bodyText, privateMemory, taggedIds));
    }

    @Mutation
    public CommentType addComment(
            @Name("memoryId") UUID memoryId,
            @Name("text") String text,
            @Name("parentId") UUID parentId,
            @Name("mediaIds") List<UUID> mediaIds
    ) {
        return CommentType.from(memoryService.addComment(
                memoryId, currentUserService.requireUser(), text, parentId, mediaIds));
    }

    @Mutation
    public TopicType createTopic(@Name("teamId") UUID teamId, @Name("title") String title) {
        return TopicType.from(topicService.create(teamId, currentUserService.requireUser(), title));
    }

    @Mutation
    public Boolean voteTopic(
            @Name("topicId") UUID topicId,
            @Name("nomineeId") UUID nomineeId,
            @Name("repetitions") Integer repetitions
    ) {
        topicService.vote(topicId, currentUserService.requireUser(), nomineeId, repetitions);
        return true;
    }

    @Mutation
    public CharacteristicType addCharacteristic(@Name("teamMemberId") UUID teamMemberId, @Name("title") String title) {
        return CharacteristicType.from(characteristicService.add(teamMemberId, currentUserService.requireUser(), title));
    }

    @Mutation
    public YearbookExportType requestYearbookExport(@Name("teamId") UUID teamId) {
        return YearbookExportType.from(yearbookPdfService.requestExport(teamId, currentUserService.requireUser()));
    }
}
