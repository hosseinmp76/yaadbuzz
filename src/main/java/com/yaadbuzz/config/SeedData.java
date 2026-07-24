package com.yaadbuzz.config;

import com.yaadbuzz.domain.Characteristic;
import com.yaadbuzz.domain.Comment;
import com.yaadbuzz.domain.Invite;
import com.yaadbuzz.domain.MediaAsset;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.Organization;
import com.yaadbuzz.domain.OrganizationMembership;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.TopicVote;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.TributeReport;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.domain.YearbookExport;
import com.yaadbuzz.enums.ExportStatus;
import com.yaadbuzz.enums.OrgRole;
import com.yaadbuzz.enums.TeamRole;
import com.yaadbuzz.enums.YearbookTheme;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.logging.Log;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Dev seed covering every domain entity (and common field variants) when the DB is empty.
 * Password for all seed users: {@code password123}
 * Join invite code: {@code welcome2026}
 */
@ApplicationScoped
public class SeedData {

    public static final String SEED_PASSWORD = "password123";
    public static final String SEED_INVITE_CODE = "welcome2026";

    @ConfigProperty(name = "yaadbuzz.seed.enabled", defaultValue = "false")
    boolean seedEnabled;

    @ConfigProperty(name = "yaadbuzz.s3.public-endpoint", defaultValue = "http://localhost:9000")
    String publicEndpoint;

    @ConfigProperty(name = "yaadbuzz.s3.bucket", defaultValue = "yaadbuzz")
    String bucket;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (!seedEnabled) {
            return;
        }
        if (User.count() > 0) {
            return;
        }

        User alice = user("alice@yaadbuzz.local", "Alice");
        User bob = user("bob@yaadbuzz.local", "Bob");
        User cara = user("cara@yaadbuzz.local", "Cara");
        User dana = user("dana@yaadbuzz.local", "Dana");

        MediaAsset orgLogo = media(alice, "seed/org-logo.png", "image/png", 12_480);
        MediaAsset teamCover = media(alice, "seed/team-cover.jpg", "image/jpeg", 84_200);
        MediaAsset aliceAvatar = media(alice, "seed/avatars/alice.png", "image/png", 9_100);
        MediaAsset bobAvatar = media(bob, "seed/avatars/bob.png", "image/png", 8_640);
        MediaAsset caraAvatar = media(cara, "seed/avatars/cara.png", "image/png", 7_920);
        MediaAsset commentPic = media(bob, "seed/comments/campfire.jpg", "image/jpeg", 41_300);

        Organization org = new Organization();
        org.name = "Northwind Academy";
        org.brandColor = "#0F766E";
        org.logo = orgLogo;
        org.owner = alice;
        org.persist();

        membership(org, alice, OrgRole.OWNER);
        membership(org, bob, OrgRole.ADMIN);
        membership(org, cara, OrgRole.MEMBER);
        membership(org, dana, OrgRole.MEMBER);

        Team team = new Team();
        team.organization = org;
        team.name = "Class of 2026";
        team.brandColor = "#0F766E";
        team.coverMedia = teamCover;
        team.revealTributes = true;
        team.revealAt = Instant.now().minus(1, ChronoUnit.DAYS);
        team.yearbookTitle = "Northwind Memories";
        team.yearbookSubtitle = "Class of 2026";
        team.yearbookDedication = "For everyone who showed up — in class, on stage, and after hours.";
        team.yearbookTheme = YearbookTheme.CLASSIC;
        team.yearbookShowMembers = true;
        team.yearbookShowTributes = true;
        team.yearbookShowCharacteristics = true;
        team.yearbookShowMemories = true;
        team.yearbookShowAwards = true;
        team.persist();

        Team alumni = new Team();
        alumni.organization = org;
        alumni.name = "Alumni Circle";
        alumni.brandColor = "#B45309";
        alumni.revealTributes = false;
        alumni.yearbookTheme = YearbookTheme.SCRAPBOOK;
        alumni.yearbookTitle = "Alumni Scrapbook";
        alumni.persist();

        TeamMember ally = member(team, alice, "Ally", TeamRole.ADMIN, "Always organizing reunions.", aliceAvatar);
        TeamMember bobby = member(team, bob, "Bobby", TeamRole.MEMBER, "Coffee enthusiast and storyteller.", bobAvatar);
        TeamMember cee = member(team, cara, "Cee", TeamRole.MEMBER, "Quiet observer with loud laughter.", caraAvatar);
        TeamMember dee = member(team, dana, "Dee", TeamRole.MEMBER, "Late-night project partner.", null);
        member(alumni, alice, "Ally", TeamRole.ADMIN, "Keeping alumni connected.", aliceAvatar);
        member(alumni, bob, "Bobby", TeamRole.MEMBER, null, bobAvatar);

        Invite invite = new Invite();
        invite.team = team;
        invite.code = SEED_INVITE_CODE;
        invite.role = TeamRole.MEMBER;
        invite.maxUses = 50;
        invite.useCount = 0;
        invite.expiresAt = Instant.now().plus(365, ChronoUnit.DAYS);
        invite.createdBy = alice;
        invite.persist();

        Invite expiredInvite = new Invite();
        expiredInvite.team = team;
        expiredInvite.code = "expiredseed01";
        expiredInvite.role = TeamRole.MEMBER;
        expiredInvite.maxUses = 5;
        expiredInvite.useCount = 5;
        expiredInvite.expiresAt = Instant.now().minus(7, ChronoUnit.DAYS);
        expiredInvite.createdBy = alice;
        expiredInvite.persist();

        Topic bandTopic = topic(team, "Most likely to start a band");
        Topic teacherTopic = topic(team, "Best unofficial teacher");
        topic(alumni, "Most likely to host a reunion");

        vote(bandTopic, bobby, ally, 2);
        vote(bandTopic, cee, bobby, 1);
        vote(bandTopic, dee, ally, 3);
        vote(teacherTopic, ally, cee, 1);
        vote(teacherTopic, bobby, cee, 2);

        Tribute publicTribute = tribute(
                team, bobby, ally,
                "You made every rehearsal better.",
                false, false, false);
        Tribute anonymousTribute = tribute(
                team, cee, bobby,
                "Your playlists carried us through finals week.",
                true, false, false);
        Tribute privateTribute = tribute(
                team, ally, cee,
                "Private note: thanks for covering for me that rainy Tuesday.",
                false, true, false);
        Tribute hiddenTribute = tribute(
                team, dee, ally,
                "This one got moderated after a report.",
                false, false, true);
        tribute(
                team, ally, dee,
                "You always brought snacks and sanity.",
                false, false, false);

        TributeReport report = new TributeReport();
        report.tribute = hiddenTribute;
        report.reporter = bobby;
        report.reason = "Inappropriate for the yearbook";
        report.persist();

        Memory sharedMemory = memory(
                team, bobby,
                "First day",
                "We laughed until dusk on the lawn outside the auditorium.",
                false,
                Set.of(ally, cee));
        Memory privateMemory = memory(
                team, ally,
                "Admin-only reminder",
                "Remember to unlock tributes before print day.",
                true,
                Set.of());
        memory(
                team, cee,
                null,
                "Untitled night: someone brought a guitar and nobody wanted to leave.",
                false,
                Set.of(bobby, dee));

        Comment root = comment(sharedMemory, cee, null, "I still have the group photo from that night.");
        Comment reply = comment(sharedMemory, bobby, root, "Send it to the yearbook channel!");
        reply.pictures.add(commentPic);
        comment(sharedMemory, ally, null, "That day still feels like the start of everything.");
        comment(privateMemory, ally, null, "Leaving this here so future-me remembers.");

        characteristic(ally, "Optimistic", 4);
        characteristic(ally, "Organizer", 3);
        characteristic(bobby, "Storyteller", 5);
        characteristic(bobby, "Caffeinated", 2);
        characteristic(cee, "Witty", 3);
        characteristic(dee, "Reliable", 2);

        export(team, alice, ExportStatus.READY,
                "seed/yearbooks/class-2026.pdf",
                publicUrl("seed/yearbooks/class-2026.pdf"),
                null,
                Instant.now().minus(2, ChronoUnit.HOURS));
        export(team, alice, ExportStatus.FAILED,
                null,
                null,
                "Seeded failure example: missing cover asset",
                Instant.now().minus(1, ChronoUnit.HOURS));
        export(team, alice, ExportStatus.PENDING, null, null, null, null);
        export(alumni, alice, ExportStatus.PROCESSING, null, null, null, null);

        Log.infof(
                "Seeded Yaadbuzz demo data. Users alice|bob|cara|dana@yaadbuzz.local / %s. Invite code: %s. Tributes=%d memories=%d",
                SEED_PASSWORD,
                SEED_INVITE_CODE,
                Tribute.count(),
                Memory.count());

        // Touch a few locals so the richer graph stays intentional and readable.
        Log.debugf("Seed variants: public=%s anon=%s private=%s hidden=%s report=%s",
                publicTribute.id, anonymousTribute.id, privateTribute.id, hiddenTribute.id, report.id);
    }

    private User user(String email, String displayName) {
        User user = new User();
        user.email = email;
        user.passwordHash = BcryptUtil.bcryptHash(SEED_PASSWORD);
        user.displayName = displayName;
        user.persist();
        return user;
    }

    private MediaAsset media(User uploader, String key, String mimeType, long sizeBytes) {
        MediaAsset asset = new MediaAsset();
        asset.storageKey = key;
        asset.url = publicUrl(key);
        asset.mimeType = mimeType;
        asset.sizeBytes = sizeBytes;
        asset.uploadedBy = uploader;
        asset.persist();
        return asset;
    }

    private String publicUrl(String key) {
        String base = publicEndpoint.endsWith("/") ? publicEndpoint.substring(0, publicEndpoint.length() - 1) : publicEndpoint;
        return base + "/" + bucket + "/" + key;
    }

    private void membership(Organization org, User user, OrgRole role) {
        OrganizationMembership membership = new OrganizationMembership();
        membership.organization = org;
        membership.user = user;
        membership.role = role;
        membership.persist();
    }

    private TeamMember member(Team team, User user, String nickname, TeamRole role, String bio, MediaAsset avatar) {
        TeamMember member = new TeamMember();
        member.team = team;
        member.user = user;
        member.nickname = nickname;
        member.role = role;
        member.bio = bio;
        member.avatar = avatar;
        member.persist();
        return member;
    }

    private Topic topic(Team team, String title) {
        Topic topic = new Topic();
        topic.team = team;
        topic.title = title;
        topic.persist();
        return topic;
    }

    private void vote(Topic topic, TeamMember voter, TeamMember nominee, int repetitions) {
        TopicVote vote = new TopicVote();
        vote.topic = topic;
        vote.voter = voter;
        vote.nominee = nominee;
        vote.repetitions = repetitions;
        vote.persist();
    }

    private Tribute tribute(
            Team team,
            TeamMember writer,
            TeamMember recipient,
            String text,
            boolean anonymous,
            boolean privateTribute,
            boolean hidden
    ) {
        Tribute tribute = new Tribute();
        tribute.team = team;
        tribute.writer = writer;
        tribute.recipient = recipient;
        tribute.text = text;
        tribute.anonymous = anonymous;
        tribute.privateTribute = privateTribute;
        tribute.hidden = hidden;
        tribute.persist();
        return tribute;
    }

    private Memory memory(
            Team team,
            TeamMember writer,
            String title,
            String body,
            boolean privateMemory,
            Set<TeamMember> tagged
    ) {
        Memory memory = new Memory();
        memory.team = team;
        memory.writer = writer;
        memory.title = title;
        memory.bodyText = body;
        memory.privateMemory = privateMemory;
        memory.tagged = tagged;
        memory.persist();
        return memory;
    }

    private Comment comment(Memory memory, TeamMember writer, Comment parent, String text) {
        Comment comment = new Comment();
        comment.memory = memory;
        comment.writer = writer;
        comment.parent = parent;
        comment.text = text;
        comment.persist();
        return comment;
    }

    private void characteristic(TeamMember member, String title, int count) {
        Characteristic characteristic = new Characteristic();
        characteristic.teamMember = member;
        characteristic.title = title;
        characteristic.count = count;
        characteristic.persist();
    }

    private void export(
            Team team,
            User requestedBy,
            ExportStatus status,
            String storageKey,
            String fileUrl,
            String errorMessage,
            Instant completedAt
    ) {
        YearbookExport export = new YearbookExport();
        export.team = team;
        export.requestedBy = requestedBy;
        export.status = status;
        export.storageKey = storageKey;
        export.fileUrl = fileUrl;
        export.errorMessage = errorMessage;
        export.completedAt = completedAt;
        export.persist();
    }
}
