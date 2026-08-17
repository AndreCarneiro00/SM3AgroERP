package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionAttachmentRequest;
import com.sm3Agro.SM3AgroERP.masterData.documentType.entity.DocumentType;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionAttachment;
import com.sm3Agro.SM3AgroERP.masterData.documentType.repository.DocumentTypeRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionAttachmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.storage.AttachmentStorageService;
import com.sm3Agro.SM3AgroERP.financial.transaction.storage.StoredAttachmentFile;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionAttachmentResult;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class FinancialTransactionAttachmentService {

    private final FinancialTransactionAttachmentRepository attachmentRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final AttachmentStorageService attachmentStorageService;
    private final FinancialTransactionService transactionService;

    public List<FinancialTransactionAttachmentResult> createAll(
            FinancialTransaction financialTransaction,
            List<FinancialTransactionAttachmentRequest> attachments,
            List<MultipartFile> files
    ) {
        if ((attachments == null || attachments.isEmpty()) && (files == null || files.isEmpty())) {
            return List.of();
        }

        validateAttachmentBatch(attachments, files);

        List<String> storedPaths = new ArrayList<>();

        try {
            return attachments.stream()
                    .map(attachmentRequest -> {
                        DocumentType documentType = resolveDocumentType(attachmentRequest.documentTypeId());
                        MultipartFile file = resolveFile(attachmentRequest, files);
                        StoredAttachmentFile storedAttachmentFile =
                                attachmentStorageService.store(financialTransaction.getId(), file);
                        storedPaths.add(storedAttachmentFile.storagePath());

                        FinancialTransactionAttachment entity = buildEntity(
                                financialTransaction,
                                documentType,
                                storedAttachmentFile,
                                attachmentRequest.observation()
                        );

                        FinancialTransactionAttachment saved = attachmentRepository.save(entity);

                        return toResult(saved);
                    })
                    .toList();
        } catch (RuntimeException exception) {
            storedPaths.forEach(attachmentStorageService::deleteQuietly);
            throw exception;
        }
    }

    @Transactional
    public FinancialTransactionAttachment create(
            Long financialTransactionId,
            CreateFinancialTransactionAttachmentRequest request,
            MultipartFile file
    ) {
        FinancialTransaction transaction = transactionService.findMutableById(financialTransactionId);
        StoredAttachmentFile storedAttachmentFile = attachmentStorageService.store(financialTransactionId, file);

        try {
            FinancialTransactionAttachment entity = buildEntity(
                    transaction,
                    resolveDocumentType(request.documentTypeId()),
                    storedAttachmentFile,
                    request.observation()
            );

            return attachmentRepository.saveAndFlush(entity);
        } catch (RuntimeException exception) {
            attachmentStorageService.deleteQuietly(storedAttachmentFile.storagePath());
            throw exception;
        }
    }

    @Transactional
    public FinancialTransactionAttachment updateMetadata(
            Long financialTransactionId,
            Long attachmentId,
            UpdateFinancialTransactionAttachmentRequest request
    ) {
        transactionService.findMutableById(financialTransactionId);
        FinancialTransactionAttachment attachment = findOwnedAttachment(financialTransactionId, attachmentId);

        attachment.setDocumentType(resolveDocumentType(request.documentTypeId()));
        attachment.setObservation(request.observation());

        return attachmentRepository.save(attachment);
    }

    @Transactional
    public FinancialTransactionAttachment replaceFile(
            Long financialTransactionId,
            Long attachmentId,
            MultipartFile file
    ) {
        transactionService.findMutableById(financialTransactionId);
        FinancialTransactionAttachment attachment = findOwnedAttachment(financialTransactionId, attachmentId);
        String previousStoragePath = attachment.getStoragePath();
        StoredAttachmentFile storedAttachmentFile = attachmentStorageService.store(financialTransactionId, file);

        try {
            applyStoredFile(attachment, storedAttachmentFile);
            FinancialTransactionAttachment saved = attachmentRepository.saveAndFlush(attachment);
            attachmentStorageService.deleteQuietly(previousStoragePath);
            return saved;
        } catch (RuntimeException exception) {
            attachmentStorageService.deleteQuietly(storedAttachmentFile.storagePath());
            throw exception;
        }
    }

    @Transactional
    public void delete(Long financialTransactionId, Long attachmentId) {
        transactionService.findMutableById(financialTransactionId);
        FinancialTransactionAttachment attachment = findOwnedAttachment(financialTransactionId, attachmentId);
        String storagePath = attachment.getStoragePath();

        attachmentRepository.delete(attachment);
        attachmentStorageService.deleteQuietly(storagePath);
    }

    private FinancialTransactionAttachment findOwnedAttachment(Long financialTransactionId, Long attachmentId) {
        return attachmentRepository.findByIdAndFinancialTransactionId(attachmentId, financialTransactionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "FinancialTransactionAttachment not found: " + attachmentId
                ));
    }

    private DocumentType resolveDocumentType(Long documentTypeId) {
        return documentTypeRepository.findById(documentTypeId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "DocumentType not found: " + documentTypeId
                ));
    }

    private FinancialTransactionAttachment buildEntity(
            FinancialTransaction financialTransaction,
            DocumentType documentType,
            StoredAttachmentFile storedAttachmentFile,
            String observation
    ) {
        return FinancialTransactionAttachment.builder()
                                .financialTransaction(financialTransaction)
                                .fileName(storedAttachmentFile.fileName())
                                .declaredContentType(storedAttachmentFile.declaredContentType())
                                .sizeBytes(storedAttachmentFile.sizeBytes())
                                .documentType(documentType)
                                .storageProvider(storedAttachmentFile.storageProvider())
                                .storagePath(storedAttachmentFile.storagePath())
                                .externalFileId(storedAttachmentFile.externalFileId())
                                .externalParentId(storedAttachmentFile.externalParentId())
                                .webUrl(storedAttachmentFile.webUrl())
                                .checksumSha256(storedAttachmentFile.checksumSha256())
                                .observation(observation)
                                .build();
    }

    private void applyStoredFile(
            FinancialTransactionAttachment attachment,
            StoredAttachmentFile storedAttachmentFile
    ) {
        attachment.setFileName(storedAttachmentFile.fileName());
        attachment.setDeclaredContentType(storedAttachmentFile.declaredContentType());
        attachment.setSizeBytes(storedAttachmentFile.sizeBytes());
        attachment.setStorageProvider(storedAttachmentFile.storageProvider());
        attachment.setStoragePath(storedAttachmentFile.storagePath());
        attachment.setExternalFileId(storedAttachmentFile.externalFileId());
        attachment.setExternalParentId(storedAttachmentFile.externalParentId());
        attachment.setWebUrl(storedAttachmentFile.webUrl());
        attachment.setChecksumSha256(storedAttachmentFile.checksumSha256());
    }

    private FinancialTransactionAttachmentResult toResult(FinancialTransactionAttachment saved) {
        return new FinancialTransactionAttachmentResult(
                saved.getId(),
                saved.getDocumentType().getId(),
                saved.getFileName(),
                saved.getDeclaredContentType(),
                saved.getSizeBytes(),
                saved.getStorageProvider(),
                saved.getStoragePath(),
                saved.getExternalFileId(),
                saved.getExternalParentId(),
                saved.getWebUrl(),
                saved.getChecksumSha256(),
                saved.getObservation()
        );
    }

    private void validateAttachmentBatch(
            List<FinancialTransactionAttachmentRequest> attachments,
            List<MultipartFile> files
    ) {
        if (attachments == null || attachments.isEmpty()) {
            throw new IllegalArgumentException("Attachment metadata is required when attachment files are sent.");
        }

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Attachment files are required when attachment metadata is informed.");
        }

        if (attachments.size() != files.size()) {
            throw new IllegalArgumentException("The number of attachment files must match attachment metadata.");
        }

        Set<Integer> usedFileIndexes = new HashSet<>();

        for (FinancialTransactionAttachmentRequest attachment : attachments) {
            if (!usedFileIndexes.add(attachment.fileIndex())) {
                throw new IllegalArgumentException(
                        "Attachment fileIndex must be unique: " + attachment.fileIndex()
                );
            }
        }
    }

    private MultipartFile resolveFile(
            FinancialTransactionAttachmentRequest attachmentRequest,
            List<MultipartFile> files
    ) {
        int fileIndex = attachmentRequest.fileIndex();

        if (fileIndex < 0 || fileIndex >= files.size()) {
            throw new IllegalArgumentException("Attachment fileIndex is out of range: " + fileIndex);
        }

        MultipartFile file = files.get(fileIndex);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Attachment file is empty for index " + fileIndex);
        }

        return file;
    }
}
