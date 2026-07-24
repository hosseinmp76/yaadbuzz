package com.yaadbuzz.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.yaadbuzz.common.ApiException;
import com.yaadbuzz.domain.Team;
import com.yaadbuzz.domain.User;
import com.yaadbuzz.domain.YearbookExport;
import com.yaadbuzz.enums.ExportStatus;
import com.yaadbuzz.service.AccessService;
import com.yaadbuzz.storage.ObjectStorageService;
import io.quarkus.logging.Log;
import io.quarkus.qute.Location;
import io.quarkus.qute.Template;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class YearbookPdfService {

    @Inject
    AccessService accessService;

    @Inject
    ObjectStorageService storageService;

    @Inject
    YearbookContentService contentService;

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
        YearbookContent content = contentService.assemble(team);
        String html = yearbookTemplate
                .data("orgName", content.orgName())
                .data("teamName", content.teamName())
                .data("title", content.title())
                .data("subtitle", content.subtitle())
                .data("dedication", content.dedication())
                .data("theme", content.theme())
                .data("brandColor", content.brandColor())
                .data("logoUrl", content.logoUrl())
                .data("coverMediaUrl", content.coverMediaUrl())
                .data("showMembers", content.showMembers())
                .data("showTributes", content.showTributes())
                .data("showCharacteristics", content.showCharacteristics())
                .data("showMemories", content.showMemories())
                .data("showAwards", content.showAwards())
                .data("members", content.members())
                .data("memories", content.memories())
                .data("topics", content.topics())
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
