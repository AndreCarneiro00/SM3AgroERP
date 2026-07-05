package com.sm3Agro.SM3AgroERP.financial.transaction.dto.response;

public record FinancialTransactionAttachmentResponse(
        Long id,
        Long documentTypeId,
        String fileName,
        String declaredContentType,
        Long sizeBytes,
        String storageProvider,
        String storagePath,
        String externalFileId,
        String externalParentId,
        String webUrl,
        String checksumSha256,
        String observation
) {
}
