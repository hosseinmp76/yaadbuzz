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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Dev seed covering every domain entity when the DB is empty.
 * Password for all seed users: {@code password123}
 * Join invite code: {@code welcome2026}
 */
@ApplicationScoped
public class SeedData {

    public static final String SEED_PASSWORD = "password123";
    public static final String SEED_INVITE_CODE = "welcome2026";

    private static final String[] CHAR_TITLES = {
            "Optimistic", "Witty", "Reliable", "Creative", "Brave",
            "Kind", "Organizer", "Storyteller", "Mentor", "Spark"
    };

    private static final String[] TOPIC_TITLES = {
            "Most likely to start a band",
            "Best unofficial teacher",
            "Most likely to bring snacks",
            "Quietest force of nature",
            "Most likely to host a reunion"
    };

    private static final String[] MEMORY_TITLES = {
            "First day on the lawn",
            "Midnight project crunch",
            "Auditorium dress rehearsal",
            "Rainy Tuesday coffee run",
            "Last lecture before summer"
    };

    private static final String[] MEMORY_BODIES = {
            "We laughed until dusk outside the auditorium and somehow already felt like a team.",
            "Someone ordered pizza at 1am and the whiteboard never looked the same again.",
            "Cue lights, missed lines, and a standing ovation from the empty seats.",
            "The whole squad showed up soaked — and still finished the deck.",
            "We signed each other's notebooks and promised to keep the group chat alive."
    };

    private static final String[] TRIBUTE_LINES = {
            "You made every rehearsal better.",
            "Your calm under pressure saved more than one deadline.",
            "Thanks for the playlists that carried us through finals.",
            "You always noticed who was left out — and fixed it.",
            "Working with you felt like having a second wind.",
            "Your jokes kept the late nights human.",
            "You brought snacks and sanity in equal measure.",
            "I still quote your one-liners from that project.",
            "You made hard days feel doable.",
            "Grateful we shared this chapter."
    };

    private static final String[] NICKNAMES = {"Ally", "Bobby", "Cee", "Dee", "Eve"};
    private static final String[] BIOS = {
            "Always organizing reunions.",
            "Coffee enthusiast and storyteller.",
            "Quiet observer with loud laughter.",
            "Late-night project partner.",
            "Design doodler and weekend hiker."
    };

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

        // Fixed seed so demo data is reproducible across restarts of empty DBs.
        Random random = new Random(2026);

        User alice = user("alice@yaadbuzz.local", "Alice");
        User bob = user("bob@yaadbuzz.local", "Bob");
        User cara = user("cara@yaadbuzz.local", "Cara");
        User dana = user("dana@yaadbuzz.local", "Dana");
        User eve = user("eve@yaadbuzz.local", "Eve");
        List<User> users = List.of(alice, bob, cara, dana, eve);

        MediaAsset orgLogo = picsum(alice, "org-logo", 400, 400);
        MediaAsset teamCover = picsum(alice, "team-cover", 1600, 900);

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
        membership(org, eve, OrgRole.MEMBER);

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

        List<TeamMember> members = new ArrayList<>();
        for (int i = 0; i < users.size(); i++) {
            User user = users.get(i);
            MediaAsset avatar = picsum(user, "avatar-" + NICKNAMES[i].toLowerCase(), 256, 256);
            TeamRole role = i == 0 ? TeamRole.ADMIN : TeamRole.MEMBER;
            members.add(member(team, user, NICKNAMES[i], role, BIOS[i], avatar));
        }
        member(alumni, alice, "Ally", TeamRole.ADMIN, "Keeping alumni connected.", members.get(0).avatar);
        member(alumni, bob, "Bobby", TeamRole.MEMBER, null, members.get(1).avatar);

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

        // One memory per member, each with an image.
        List<Memory> memories = new ArrayList<>();
        for (int i = 0; i < members.size(); i++) {
            TeamMember writer = members.get(i);
            Set<TeamMember> tagged = new HashSet<>();
            tagged.add(members.get((i + 1) % members.size()));
            tagged.add(members.get((i + 2) % members.size()));
            Memory memory = memory(
                    team,
                    writer,
                    MEMORY_TITLES[i],
                    MEMORY_BODIES[i],
                    false,
                    tagged,
                    Set.of(picsum(writer.user, "memory-" + i, 1200, 800)));
            memories.add(memory);
        }

        // Comments: text-only, text+photo, and photo-only across memories.
        Comment root = comment(
                memories.get(0),
                members.get(2),
                null,
                "I still have the group photo from that night.",
                Set.of());
        comment(
                memories.get(0),
                members.get(1),
                root,
                "Send it to the yearbook channel!",
                Set.of(picsum(bob, "comment-campfire", 900, 600)));
        comment(
                memories.get(0),
                members.get(0),
                null,
                "That day still feels like the start of everything.",
                Set.of());
        comment(
                memories.get(1),
                members.get(3),
                null,
                "The whiteboard scars remain. Worth it.",
                Set.of(picsum(dana, "comment-crunch", 1000, 700)));
        comment(
                memories.get(1),
                members.get(4),
                null,
                "Who else remembers the 2am victory dance?",
                Set.of());
        comment(
                memories.get(2),
                members.get(0),
                null,
                "Encore energy even with empty seats.",
                Set.of(
                        picsum(alice, "comment-rehearsal-1", 900, 600),
                        picsum(alice, "comment-rehearsal-2", 900, 600)));
        comment(
                memories.get(3),
                members.get(2),
                null,
                "",
                Set.of(picsum(cara, "comment-coffee-only", 800, 800)));
        comment(
                memories.get(3),
                members.get(1),
                null,
                "Still smells like wet jackets and good ideas.",
                Set.of());
        comment(
                memories.get(4),
                members.get(3),
                null,
                "Notebook signatures forever.",
                Set.of(picsum(dana, "comment-last-lecture", 1100, 750)));
        comment(
                memories.get(4),
                members.get(4),
                null,
                "Group chat is still alive — barely.",
                Set.of());

        // Each member writes a tribute (with image) for every other member.
        int tributeIdx = 0;
        for (TeamMember writer : members) {
            for (TeamMember recipient : members) {
                if (writer.id.equals(recipient.id)) {
                    continue;
                }
                boolean anonymous = tributeIdx % 7 == 0;
                boolean privateTribute = tributeIdx % 11 == 0;
                Tribute seeded = tribute(
                        team,
                        writer,
                        recipient,
                        TRIBUTE_LINES[tributeIdx % TRIBUTE_LINES.length],
                        anonymous,
                        privateTribute,
                        Set.of(picsum(writer.user, "tribute-" + tributeIdx, 1000, 700)));
                // Publish most non-private tributes so the yearbook has content.
                if (!privateTribute && tributeIdx % 3 != 0) {
                    seeded.hidden = false;
                }
                tributeIdx++;
            }
        }

        // Each member adds 2 characteristics for every other member.
        for (int wi = 0; wi < members.size(); wi++) {
            for (int ri = 0; ri < members.size(); ri++) {
                if (wi == ri) {
                    continue;
                }
                TeamMember recipient = members.get(ri);
                String titleA = CHAR_TITLES[(wi * 3 + ri) % CHAR_TITLES.length];
                String titleB = CHAR_TITLES[(wi * 3 + ri + 1) % CHAR_TITLES.length];
                bumpCharacteristic(recipient, titleA);
                bumpCharacteristic(recipient, titleB);
            }
        }

        // Five topics; each member votes once per topic for a random other member.
        List<Topic> topics = new ArrayList<>();
        for (String title : TOPIC_TITLES) {
            topics.add(topic(team, title));
        }
        topic(alumni, "Most likely to host a reunion");

        for (Topic topicEntity : topics) {
            for (TeamMember voter : members) {
                TeamMember nominee = randomOther(random, members, voter);
                vote(topicEntity, voter, nominee, 1 + random.nextInt(3));
            }
        }

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
                "Seeded Yaadbuzz demo data. Users alice|bob|cara|dana|eve@yaadbuzz.local / %s. Invite: %s. "
                        + "Members=%d tributes=%d memories=%d comments=%d topics=%d votes=%d characteristics=%d",
                SEED_PASSWORD,
                SEED_INVITE_CODE,
                members.size(),
                Tribute.count(),
                Memory.count(),
                Comment.count(),
                Topic.count("team.id = ?1", team.id),
                TopicVote.count(),
                Characteristic.count());
    }

    private User user(String email, String displayName) {
        User user = new User();
        user.email = email;
        user.passwordHash = BcryptUtil.bcryptHash(SEED_PASSWORD);
        user.displayName = displayName;
        user.persist();
        return user;
    }

    /** Demo image via picsum (no MinIO object required). */
    private MediaAsset picsum(User uploader, String seedKey, int width, int height) {
        MediaAsset asset = new MediaAsset();
        asset.storageKey = "seed/" + seedKey + ".jpg";
        asset.url = "https://picsum.photos/seed/yaadbuzz-" + seedKey + "/" + width + "/" + height;
        asset.mimeType = "image/jpeg";
        asset.sizeBytes = (long) width * height / 20;
        asset.uploadedBy = uploader;
        asset.persist();
        return asset;
    }

    private String publicUrl(String key) {
        String base = publicEndpoint.endsWith("/")
                ? publicEndpoint.substring(0, publicEndpoint.length() - 1)
                : publicEndpoint;
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

    private TeamMember randomOther(Random random, List<TeamMember> members, TeamMember voter) {
        List<TeamMember> others = members.stream()
                .filter(m -> !m.id.equals(voter.id))
                .toList();
        return others.get(random.nextInt(others.size()));
    }

    private Tribute tribute(
            Team team,
            TeamMember writer,
            TeamMember recipient,
            String text,
            boolean anonymous,
            boolean privateTribute,
            Set<MediaAsset> pictures
    ) {
        Tribute tribute = new Tribute();
        tribute.team = team;
        tribute.writer = writer;
        tribute.recipient = recipient;
        tribute.text = text;
        tribute.anonymous = anonymous;
        tribute.privateTribute = privateTribute;
        tribute.pictures = pictures == null ? new HashSet<>() : new HashSet<>(pictures);
        tribute.persist();
        return tribute;
    }

    private Memory memory(
            Team team,
            TeamMember writer,
            String title,
            String body,
            boolean privateMemory,
            Set<TeamMember> tagged,
            Set<MediaAsset> pictures
    ) {
        Memory memory = new Memory();
        memory.team = team;
        memory.writer = writer;
        memory.title = title;
        memory.bodyText = body;
        memory.privateMemory = privateMemory;
        memory.tagged = tagged;
        memory.pictures = pictures == null ? new HashSet<>() : new HashSet<>(pictures);
        memory.persist();
        return memory;
    }

    private Comment comment(
            Memory memory,
            TeamMember writer,
            Comment parent,
            String text,
            Set<MediaAsset> pictures
    ) {
        Comment comment = new Comment();
        comment.memory = memory;
        comment.writer = writer;
        comment.parent = parent;
        comment.text = text == null ? "" : text;
        comment.pictures = pictures == null ? new HashSet<>() : new HashSet<>(pictures);
        comment.persist();
        return comment;
    }

    private void bumpCharacteristic(TeamMember member, String title) {
        Characteristic characteristic = Characteristic.findByMemberAndTitle(member.id, title)
                .orElseGet(() -> {
                    Characteristic c = new Characteristic();
                    c.teamMember = member;
                    c.title = title;
                    c.count = 0;
                    c.persist();
                    return c;
                });
        characteristic.count += 1;
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
