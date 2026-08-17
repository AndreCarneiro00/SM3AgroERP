package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.nio.file.Files;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class FinancialTransactionAttachmentServiceIT extends AbstractFinancialTransactionIT {

    @Autowired
    private FinancialTransactionAttachmentService attachmentService;

    @Test
    void shouldPersistAttachmentsWithDocumentType() {
        FinancialTransaction transaction = createPersistedTransaction();
        var documentType = createDocumentType();
        var files = createAttachmentFiles();

        var result = attachmentService.createAll(transaction, List.of(
                new FinancialTransactionAttachmentRequest(
                        documentType.getId(),
                        0,
                        "obs"
                )
        ), files);
        var storedAttachment = result.getFirst();
        var storedFilePath = resolveStoredAttachmentPath(storedAttachment.storagePath());

        assertEquals(1, result.size());
        assertEquals(1, financialTransactionAttachmentRepository.count());
        assertEquals(documentType.getId(), storedAttachment.documentTypeId());
        assertEquals("LOCAL", storedAttachment.storageProvider());
        assertEquals(files.getFirst().getSize(), storedAttachment.sizeBytes());
        assertTrue(Files.exists(storedFilePath));
        assertTrue(storedAttachment.checksumSha256() != null && !storedAttachment.checksumSha256().isBlank());
    }

    @Test
    void shouldThrowWhenAttachmentFilesAreMissing() {
        FinancialTransaction transaction = createPersistedTransaction();
        var documentType = createDocumentType();

        assertThrows(IllegalArgumentException.class, () -> attachmentService.createAll(transaction, List.of(
                new FinancialTransactionAttachmentRequest(
                        documentType.getId(),
                        0,
                        "obs"
                )
        ), List.of()));
    }

    @Test
    void shouldThrowWhenDocumentTypeDoesNotExist() {
        FinancialTransaction transaction = createPersistedTransaction();

        assertThrows(RuntimeException.class, () -> attachmentService.createAll(transaction, List.of(
                new FinancialTransactionAttachmentRequest(
                        99999L,
                        0,
                        "obs"
                )
        ), createAttachmentFiles()));
    }
}

