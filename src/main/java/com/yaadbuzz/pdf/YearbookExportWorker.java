package com.yaadbuzz.pdf;

import com.yaadbuzz.domain.YearbookExport;
import com.yaadbuzz.enums.ExportStatus;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;

@ApplicationScoped
public class YearbookExportWorker {

    @Inject
    YearbookPdfService yearbookPdfService;

    @Scheduled(every = "10s")
    @Transactional
    void pollPendingExports() {
        List<YearbookExport> pending = YearbookExport.list("status = ?1 order by createdAt asc", ExportStatus.PENDING);
        for (YearbookExport export : pending) {
            yearbookPdfService.processExport(export.id);
        }
    }
}
