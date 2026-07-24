package com.yaadbuzz.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Characteristic;
import com.yaadbuzz.domain.Memory;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.TeamMember;
import com.yaadbuzz.domain.Topic;
import com.yaadbuzz.domain.TopicVote;
import com.yaadbuzz.domain.Tribute;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.domain.YearbookExport;
import com.yaadbuzz.enums.ExportStatus;
import com.yaadbuzz.service.AccessService;
import com.yaadbuzz.service.TopicService;
import com.yaadbuzz.storage.ObjectStorageService;
import io.quarkus.logging.Log;
import io.quarkus.qute.Location;
import io.quarkus.qute.Template;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class YearbookPdfService {

    @Inject
    AccessService accessService;

    @Inject
    ObjectStorageService storageService;

    @Inject
    TopicService topicService;

    @Inject
    @Location("yearbook/yearbook.html")
    Template yearbookTemplate;

    @Transactional
    public YearbookExport requestExport(UUID teamId, User user) {
        accessService.requireTeamAdmin(teamId, user);
        Team team = accessService.requireTeam(teamId);
        YearbookExport export = new YearbookExport();
        export.team = team;
        export.requestedBy = user;
        export.status = ExportStatus.PENDING;
        export.persist();
        return export;
    }

    @Transactional
    public void processExport(UUID exportId) {
        YearbookExport export = YearbookExport.findById(exportId);
        if (export == null) {
            return;
        }
        export.status = ExportStatus.PROCESSING;
        try {
            byte[] pdf = renderPdf(export.team);
            var stored = storageService.upload(pdf, "application/pdf", "yearbooks");
            export.storageKey = stored.storageKey();
            export.fileUrl = stored.url();
            export.status = ExportStatus.READY;
            export.completedAt = Instant.now();
            export.errorMessage = null;
        } catch (Exception e) {
            Log.error("Yearbook export failed", e);
            export.status = ExportStatus.FAILED;
            export.errorMessage = e.getMessage();
            export.completedAt = Instant.now();
        }
    }

    public byte[] loadPdf(UUID exportId, User user) {
        YearbookExport export = YearbookExport.findById(exportId);
        if (export == null) {
            throw ApiException.notFound("Export not found");
        }
        accessService.requireTeamMember(export.team.id, user);
        if (export.status != ExportStatus.READY || export.storageKey == null) {
            throw ApiException.badRequest("Export is not ready");
        }
        return storageService.download(export.storageKey);
    }

    public List<YearbookExport> listExports(UUID teamId, User user) {
        accessService.requireTeamMember(teamId, user);
        return YearbookExport.listByTeam(teamId);
    }

    private byte[] renderPdf(Team team) throws Exception {
        List<TeamMember> members = TeamMember.list("team.id = ?1 and deletedAt is null order by nickname asc", team.id);
        List<Tribute> tributes = Tribute.list("team.id = ?1 and deletedAt is null and hidden = false order by createdAt asc", team.id);
        List<Memory> memories = Memory.list("team.id = ?1 and deletedAt is null and privateMemory = false order by createdAt asc", team.id);
        List<Topic> topics = Topic.list("team.id = ?1 and deletedAt is null order by createdAt asc", team.id);

        Map<UUID, List<Map<String, Object>>> tributesByRecipient = new HashMap<>();
        for (Tribute tribute : tributes) {
            tributesByRecipient
                    .computeIfAbsent(tribute.recipient.id, k -> new java.util.ArrayList<>())
                    .add(Map.of(
                            "text", tribute.text,
                            "writer", tribute.anonymous ? "Anonymous" : tribute.writer.nickname
                    ));
        }

        List<Map<String, Object>> memberViews = members.stream().map(m -> {
            List<Characteristic> characteristics = Characteristic.list("teamMember.id = ?1 order by count desc", m.id);
            return Map.<String, Object>of(
                    "nickname", m.nickname,
                    "bio", m.bio == null ? "" : m.bio,
                    "avatarUrl", m.avatar == null ? "" : m.avatar.url,
                    "tributes", tributesByRecipient.getOrDefault(m.id, List.of()),
                    "characteristics", characteristics.stream()
                            .map(c -> Map.of("title", c.title, "count", c.count))
                            .toList()
            );
        }).toList();

        List<Map<String, Object>> topicViews = topics.stream().map(t -> {
            List<TopicVote> votes = TopicVote.list("topic.id", t.id);
            Map<UUID, Integer> scores = new HashMap<>();
            Map<UUID, TeamMember> nominees = new HashMap<>();
            for (TopicVote vote : votes) {
                scores.merge(vote.nominee.id, vote.repetitions, Integer::sum);
                nominees.put(vote.nominee.id, vote.nominee);
            }
            List<Map<String, Object>> standings = scores.entrySet().stream()
                    .sorted(Map.Entry.<UUID, Integer>comparingByValue().reversed())
                    .limit(3)
                    .map(e -> Map.<String, Object>of(
                            "nickname", nominees.get(e.getKey()).nickname,
                            "score", e.getValue()))
                    .toList();
            return Map.<String, Object>of("title", t.title, "standings", standings);
        }).toList();

        List<Map<String, Object>> memoryViews = memories.stream()
                .sorted(Comparator.comparing((Memory m) -> m.createdAt))
                .map(m -> Map.<String, Object>of(
                        "title", m.title == null ? "" : m.title,
                        "body", m.bodyText,
                        "writer", m.writer.nickname
                ))
                .toList();

        String brand = team.brandColor == null
                ? (team.organization.brandColor == null ? "#0F766E" : team.organization.brandColor)
                : team.brandColor;
        String logoUrl = team.organization.logo == null ? "" : team.organization.logo.url;

        String html = yearbookTemplate
                .data("orgName", team.organization.name)
                .data("teamName", team.name)
                .data("brandColor", brand)
                .data("logoUrl", logoUrl)
                .data("members", memberViews)
                .data("memories", memoryViews)
                .data("topics", topicViews)
                .render();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        }
    }
}
