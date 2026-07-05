package com.sm3Agro.SM3AgroERP.financial.transaction.storage;

import org.springframework.web.multipart.MultipartFile;

public interface AttachmentStorageService {

    StoredAttachmentFile store(Long financialTransactionId, MultipartFile file);

    void deleteQuietly(String storagePath);
}
