package com.sm3Agro.SM3AgroERP.financial.transaction.storage;

public record StoredAttachmentFile(
        String fileName,
        String declaredContentType,
        Long sizeBytes,
        String storageProvider,
        String storagePath,
        String externalFileId,
        String externalParentId,
        String webUrl,
        String checksumSha256
) {
}
