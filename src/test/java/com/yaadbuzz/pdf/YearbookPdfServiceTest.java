package com.yaadbuzz.pdf;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.yaadbuzz.domain.User;
import com.yaadbuzz.domain.YearbookExport;
import com.yaadbuzz.enums.ExportStatus;
import com.yaadbuzz.service.OrganizationService;
import com.yaadbuzz.service.TeamService;
import com.yaadbuzz.storage.ObjectStorageService;
import com.yaadbuzz.support.AuthSupport;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
class YearbookPdfServiceTest {

    @Inject
    YearbookPdfService yearbookPdfService;

    @Inject
    OrganizationService organizationService;

    @Inject
    TeamService teamService;

    @InjectMock
    ObjectStorageService objectStorageService;

    @BeforeEach
    void stubStorage() {
        when(objectStorageService.upload(any(), anyString(), anyString()))
                .thenReturn(new ObjectStorageService.StoredObject(
                        "yearbooks/test.pdf",
                        "http://localhost:9000/yaadbuzz/yearbooks/test.pdf"
                ));
        when(objectStorageService.download(anyString()))
                .thenReturn("%PDF-1.4 test".getBytes());
    }

    @Test
    @Transactional
    void requestAndProcessExportMarksReady() {
        String email = "pdf-" + UUID.randomUUID() + "@example.com";
        AuthSupport.register(email, "password123", "PdfUser");
        User user = User.findByEmail(email).orElseThrow();

        var org = organizationService.create(user, "Pdf Org", "#0F766E");
        var team = teamService.create(user, org.id, "Pdf Team", "#0F766E");

        YearbookExport export = yearbookPdfService.requestExport(team.id, user);
        assertEquals(ExportStatus.PENDING, export.status);

        yearbookPdfService.processExport(export.id);

        YearbookExport reloaded = YearbookExport.findById(export.id);
        assertEquals(ExportStatus.READY, reloaded.status);
        assertTrue(reloaded.fileUrl.contains("yearbooks/test.pdf"));
        assertEquals("yearbooks/test.pdf", reloaded.storageKey);

        byte[] pdf = yearbookPdfService.loadPdf(export.id, user);
        assertArrayEquals("%PDF-1.4 test".getBytes(), pdf);
    }
}
